// Load environment variables
require('dotenv').config();

const path = require('path');
const express = require('express');
const { GeminiService } = require('./services/geminiService');

// Create Express server
const app = express();
const PORT = process.env.PORT || 3978;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini Service
const geminiService = new GeminiService();

// Store conversation histories
const conversationHistories = new Map();

// Chat endpoint
app.post('/api/messages', async (req, res) => {
    try {
        const { text, conversation, forceHindi } = req.body;
        const conversationId = conversation?.id || 'default';
        const userMessage = text || '';

        if (!userMessage.trim()) {
            return res.json({ text: 'Please type a message to continue our conversation!' });
        }

        // Get or create conversation history
        if (!conversationHistories.has(conversationId)) {
            conversationHistories.set(conversationId, []);
        }
        const history = conversationHistories.get(conversationId);

        // Get response from Gemini
        const response = await geminiService.chat(userMessage, history, forceHindi);

        // Update conversation history (only if guardrail wasn't triggered)
        if (!response.guardrailTriggered) {
            history.push({ role: 'user', content: userMessage });
            history.push({ role: 'model', content: response.message });

            // Limit history to last 20 messages
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
        }

        // Send response
        res.json({
            text: response.message,
            guardrail: response.guardrailTriggered || null
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.json({
            text: '😅 Something went wrong. Please try again or contact Ambuj at kumarambuj8@gmail.com'
        });
    }
});

// Image Analysis endpoint
app.post('/api/analyze-image', async (req, res) => {
    try {
        const { image, mimeType, prompt } = req.body;

        if (!image) {
            return res.json({ text: '📷 Please upload an image to analyze.' });
        }

        // Remove data URL prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const response = await geminiService.analyzeImage(base64Data, mimeType || 'image/jpeg', prompt);

        res.json({ text: response.message });

    } catch (error) {
        console.error('Image analysis error:', error);
        res.json({ text: '😅 Could not analyze the image. Please try again.' });
    }
});

// Get bot configuration (for sliders display)
app.get('/api/config', (req, res) => {
    const config = geminiService.getConfig();
    res.json({
        temperature: config.temperature,
        maxTokens: config.maxOutputTokens,
        topP: config.topP,
        topK: config.topK,
        model: 'Gemini 2.0 Flash Exp',
        features: {
            textChat: true,
            imageAnalysis: true,
            imageGeneration: false, // Not available in free tier
            guardrails: true
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        bot: "Ambuj's Resume Bot",
        framework: 'MS Bot Framework SDK + Gemini API',
        features: ['Text Chat', 'Image Analysis', 'Content Guardrails']
    });
});

// Clear conversation endpoint
app.post('/api/clear', (req, res) => {
    const { conversationId } = req.body;
    if (conversationId && conversationHistories.has(conversationId)) {
        conversationHistories.delete(conversationId);
    }
    res.json({ success: true, message: 'Conversation cleared' });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cleanup old conversations every hour
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleaned = 0;
    for (const [id] of conversationHistories) {
        if (conversationHistories.size > 100) {
            conversationHistories.delete(id);
            cleaned++;
            if (cleaned >= 50) break;
        }
    }
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} old conversations`);
    }
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 Ambuj's Resume Bot is running!                        ║
║                                                            ║
║   📍 Local:        http://localhost:${PORT}                  ║
║   📍 Chat API:     http://localhost:${PORT}/api/messages     ║
║   📍 Image API:    http://localhost:${PORT}/api/analyze-image║
║   📍 Config:       http://localhost:${PORT}/api/config       ║
║                                                            ║
║   ✨ Features:                                              ║
║      • Text Chat with Guardrails                           ║
║      • Image Analysis (Vision)                             ║
║      • Multi-turn Conversations                            ║
║                                                            ║
║   Built with MS Bot Framework SDK + Gemini API             ║
║   By Ambuj Kumar Tripathi                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
