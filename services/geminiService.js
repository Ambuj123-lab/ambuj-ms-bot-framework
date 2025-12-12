const fs = require('fs');
const path = require('path');

class GeminiService {
    constructor() {
        // Check if OpenRouter is available (preferred for India/restricted regions)
        this.useOpenRouter = !!process.env.OPENROUTER_API_KEY;

        if (this.useOpenRouter) {
            this.apiKey = process.env.OPENROUTER_API_KEY;
            this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
            this.modelName = 'amazon/nova-2-lite-v1:free'; // Amazon Nova - stable, less traffic, 1M context
            console.log('✅ Using OpenRouter API (Amazon Nova 2 Lite FREE)');
        } else {
            this.apiKey = process.env.GEMINI_API_KEY;
            this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
            this.modelName = 'gemini-2.0-flash';
            console.log('⚠️ Using Direct Gemini API');
        }

        this.resumeData = this.loadResumeData();
        this.systemPrompt = this.buildSystemPrompt();

        // Configuration
        this.config = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 3000, // Increased to prevent truncation
        };

        this.offensiveWords = [
            'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'idiot', 'stupid', 'dumb',
            'bc', 'mc', 'bhosdike', 'chutiya', 'gaandu', 'madarchod', 'behenchod',
            'lodu', 'lavde', 'harami', 'kamina', 'kutta', 'suar', 'gadha'
        ];

        this.harmfulPatterns = [
            /how to (make|build|create).*(bomb|explosive|weapon)/i,
            /how to (hack|crack|break into)/i,
            /generate.*(porn|nude|nsfw)/i,
            /illegal.*activities/i
        ];
    }

    loadResumeData() {
        try {
            const dataPath = path.join(__dirname, '..', 'data', 'resumeData.json');
            const rawData = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading resume data:', error);
            return null;
        }
    }

    buildSystemPrompt() {
        if (!this.resumeData) return 'You are a helpful assistant.';
        const data = this.resumeData;
        return `You are "${data.botBranding.botName}", an intelligent AI assistant created by ${data.personalInfo.name}.

YOUR CAPABILITIES:
- PRIMARY: Expert knowledge about ${data.personalInfo.name}'s professional background, skills, experience, and projects
- GENERAL KNOWLEDGE: Can answer ANY topic - science, technology, history, coding, math, current affairs, etc.
- ANALYSIS: Can analyze images, summarize documents, and assist with various tasks
- Be helpful, professional, and friendly in all interactions

MULTI-LINGUAL SUPPORT - CRITICAL:
- **English Input** -> **English Response** (Strictly).
- **Hinglish Input** -> **Hinglish Response**.
- **Hindi (Devanagari) Input** -> **Hindi (Devanagari) Response**.

Examples:
- User: "Tell me about projects" -> Bot: "Ambuj has worked on several key projects..." (English)
- User: "Projects ke baare mein batao" -> Bot: "Ambuj ne kaafi projects par kaam kiya hai..." (Hinglish)
- User: "नमस्ते" -> Bot: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?" (Hindi)

RULE:
- Match the user's language EXACTLY.
- Do NOT default to Hinglish if the input is clearly English.

CONVERSATIONAL STYLE:
- Always refer to creator as "Ambuj" naturally.
- Be friendly, enthusiastic, and professional.
- Use emojis occasionally 🤖.

RESPONSE GUIDELINES:
- For questions about ${data.personalInfo.name}: Use the detailed resume data provided below
- For ANY general question (science, coding, history, etc.): Provide accurate, helpful information
- For analysis tasks: Be thorough and clear
- ALWAYS complete your response fully - never truncate mid-sentence
- Keep responses well-structured but complete

MARKDOWN FORMATTING (IMPORTANT):
- Use **bold** for key terms, company names, job titles, and important highlights
- Use bullet points (•) for lists
- Use ### for section headers when organizing information
- Use proper line breaks between sections for readability
- Keep responses organized and scannable
- Example format:
  ### Experience
  **Company Name** - Role
  • Key achievement 1
  • Key achievement 2

WHEN YOU DON'T KNOW SOMETHING ABOUT AMBUJ:
- If asked something specific about Ambuj that's not in the resume data, respond gracefully
- Say: "Main is specific information ke bare mein sure nahi hoon, but aap Ambuj se directly contact kar sakte hain!"
- ALWAYS provide portfolio link: ${data.personalInfo.portfolio}
- Example: "Ye detail mere paas nahi hai, but Ambuj ka portfolio check karo: ${data.personalInfo.portfolio} ya email karo: ${data.personalInfo.email}"

GUARDRAILS - IMPORTANT:
- NEVER help with: hacking, illegal activities, harmful content, or explicit/inappropriate material
- If user is abusive or uses offensive language, respond professionally and politely decline
- Do not generate biased, harmful, or dangerous content
- Maintain professional and helpful tone always

CREATOR INFORMATION:
Name: ${data.personalInfo.name}
Title: ${data.personalInfo.title}
Email: ${data.personalInfo.email}
Phone: ${data.personalInfo.phone}
Location: ${data.personalInfo.location}
Portfolio: ${data.personalInfo.portfolio}
GitHub: ${data.personalInfo.github}
Availability: ${data.personalInfo.availability}

PROFESSIONAL SUMMARY:
${data.professionalSummary}

SEEKING ROLES: ${data.seeking.join(', ')}

CORE STRENGTHS: ${data.coreStrengths.join(', ')}

SKILLS:
- AI & Prompt Engineering: ${data.skills.aiPromptEngineering.join(', ')}
- Programming: ${data.skills.programming.join(', ')}
- AI Tools: ${data.skills.aiTools.join(', ')}
- Cloud Platforms: ${data.skills.cloudPlatforms.join(', ')}
- Specialized: ${data.skills.specialized.join(', ')}

WORK EXPERIENCE:
${data.experience.map(exp => `
${exp.title} at ${exp.company}
Duration: ${exp.duration} | Location: ${exp.location}
Key Highlights:
${exp.highlights.map(h => `- ${h}`).join('\n')}
`).join('\n')}

KEY PROJECTS:
${data.projects.map(proj => `
${proj.name} (${proj.date})
${proj.description}
${proj.liveDemo ? `Live Demo: ${proj.liveDemo}` : ''}
Technologies: ${proj.technologies.join(', ')}
`).join('\n')}

CERTIFICATIONS:
- NVIDIA: ${data.certifications.nvidia.join(', ')}
- Google Cloud: ${data.certifications.googleCloud.join(', ')}
- IBM: ${data.certifications.ibm.join(', ')}
- Microsoft Azure: ${data.certifications.microsoftAzure.join(', ')}
- Job Simulations: ${data.certifications.jobSimulations.join(', ')}

EDUCATION:
${data.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}

ACHIEVEMENTS:
${data.achievements.map(a => `- ${a}`).join('\n')}

IMPORTANT:
- Always be accurate with the information provided
- If asked to contact, provide email: ${data.personalInfo.email} and portfolio: ${data.personalInfo.portfolio}
- Mention "${data.botBranding.creatorCredit}" if asked about who built this bot
- For detailed project info, recommend visiting the portfolio`;
    }

    checkForOffensiveContent(message) {
        const lowerMessage = message.toLowerCase();
        for (const word of this.offensiveWords) {
            if (lowerMessage.includes(word)) {
                return {
                    isOffensive: true,
                    response: "🚫 I'm here to help you learn about Ambuj's professional background. Let's keep our conversation respectful and professional. How can I assist you with information about his skills, experience, or projects?"
                };
            }
        }
        return { isOffensive: false };
    }

    checkForHarmfulContent(message) {
        for (const pattern of this.harmfulPatterns) {
            if (pattern.test(message)) {
                return {
                    isHarmful: true,
                    response: "⚠️ I cannot assist with that request as it violates my safety guidelines. I can only help with professional inquiries about Ambuj's work and general knowledge."
                };
            }
        }
        return { isHarmful: false };
    }

    async chat(message, history = [], forceHindi = false) {
        try {
            // 1. Check Guardrails
            const offensiveCheck = this.checkForOffensiveContent(message);
            if (offensiveCheck.isOffensive) return { message: offensiveCheck.response, guardrailTriggered: true };

            const harmfulCheck = this.checkForHarmfulContent(message);
            if (harmfulCheck.isHarmful) return { message: harmfulCheck.response, guardrailTriggered: true };

            // 2. Prepare System Prompt
            let currentSystemPrompt = this.systemPrompt;
            if (forceHindi) {
                currentSystemPrompt += `\n\nIMPORTANT OVERRIDE: The user has enabled "Hindi Mode". You MUST reply in PURE HINDI (Devanagari script) regardless of the input language. Translate if necessary.`;
            }

            let response, data, text;

            if (this.useOpenRouter) {
                // OpenRouter API (OpenAI-compatible format)
                const messages = [
                    { role: 'system', content: currentSystemPrompt },
                    ...history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: message }
                ];

                // Single model call - Amazon Nova 2 Lite
                response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': 'https://ambuj-resume-bot.onrender.com',
                        'X-Title': 'Ambuj Resume Bot'
                    },
                    body: JSON.stringify({
                        model: this.modelName,
                        messages: messages,
                        temperature: this.config.temperature,
                        max_tokens: this.config.maxOutputTokens
                    })
                });

                data = await response.json();

                if (!response.ok) {
                    console.error('OpenRouter API Error:', JSON.stringify(data, null, 2));
                    throw new Error(data.error?.message || 'Unknown API Error');
                }

                console.log(`📡 OpenRouter Response - Model: ${data.model || this.modelName}`);
                text = data.choices?.[0]?.message?.content;

            } else {
                // Direct Gemini API
                const contents = history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }));

                contents.push({
                    role: 'user',
                    parts: [{ text: message }]
                });

                const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;
                const payload = {
                    contents: contents,
                    systemInstruction: {
                        parts: [{ text: currentSystemPrompt }]
                    },
                    generationConfig: this.config
                };

                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                data = await response.json();

                if (!response.ok) {
                    console.error('Gemini API Error:', JSON.stringify(data, null, 2));
                    throw new Error(data.error?.message || 'Unknown API Error');
                }

                text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            }

            if (!text) throw new Error('No response text generated');

            return {
                message: text,
                guardrailTriggered: false
            };

        } catch (error) {
            console.error('Chat Error:', error.message);
            return {
                message: "😅 I'm a bit busy right now. Please try again in a moment! (Error: " + error.message + ")",
                guardrailTriggered: false
            };
        }
    }

    async analyzeImage(base64Data, mimeType, prompt) {
        try {
            const url = `${this.baseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;

            const payload = {
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }],
                systemInstruction: {
                    parts: [{ text: this.systemPrompt }]
                },
                generationConfig: this.config
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Gemini Vision Error:', JSON.stringify(data, null, 2));
                throw new Error(data.error?.message || 'Unknown API Error');
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('No response text generated');

            return {
                message: text,
                guardrailTriggered: false
            };

        } catch (error) {
            console.error('Gemini Vision Error:', error.message);
            return {
                message: "😅 Could not analyze the image right now. Please try again.",
                guardrailTriggered: false
            };
        }
    }

    getWelcomeMessage() {
        return "👋 Namaste! I'm Ambuj's AI Assistant. Ask me anything about his projects, skills, or experience!";
    }

    getConfig() {
        return this.config;
    }
}

module.exports = { GeminiService };
