require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ API Key is VALID!');
            console.log('ALL Available Models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error('❌ API Key Error:', data.error.message);
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

listModels();
