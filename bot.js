const { ActivityHandler, MessageFactory } = require('botbuilder');
const { GeminiService } = require('./services/geminiService');

class ResumeBot extends ActivityHandler {
    constructor() {
        super();

        this.geminiService = new GeminiService();

        // Store conversation histories (in-memory for simplicity)
        // In production, use Azure Blob Storage or database
        this.conversationHistories = new Map();

        // Handle incoming messages
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;
            const conversationId = context.activity.conversation.id;

            // Get or create conversation history
            if (!this.conversationHistories.has(conversationId)) {
                this.conversationHistories.set(conversationId, []);
            }
            const history = this.conversationHistories.get(conversationId);

            // Show typing indicator
            await context.sendActivity({ type: 'typing' });

            // Get response from Gemini
            const response = await this.geminiService.chat(userMessage, history);

            // Update conversation history
            history.push({ role: 'user', content: userMessage });
            history.push({ role: 'model', content: response.message });

            // Limit history to last 20 messages to save tokens
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }

            // Send response
            await context.sendActivity(MessageFactory.text(response.message));

            await next();
        });

        // Handle new members joining the conversation
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeMessage = this.geminiService.getWelcomeMessage();

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeMessage));
                }
            }

            await next();
        });

        // Handle conversation update (cleanup old histories periodically)
        this.onConversationUpdate(async (context, next) => {
            // Clean up old conversation histories (older than 1 hour)
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            for (const [id, history] of this.conversationHistories) {
                if (history.timestamp && history.timestamp < oneHourAgo) {
                    this.conversationHistories.delete(id);
                }
            }
            await next();
        });
    }
}

module.exports = { ResumeBot };
