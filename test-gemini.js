require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Trying the model found in the list
    const modelName = 'gemini-2.0-flash-exp';

    console.log(`Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        console.log(`✅ Success with ${modelName}! Response:`, result.response.text());
    } catch (error) {
        console.error(`❌ Error with ${modelName}:`, error.message);
    }
}

test();
