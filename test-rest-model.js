require('dotenv').config();

const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testModel(modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: 'Hello, just testing.' }]
        }]
    };

    try {
        console.log(`Testing ${modelName}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS: ${modelName} is working!`);
            return true;
        } else {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`   Error: ${data.error?.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ NETWORK ERROR: ${modelName} - ${error.message}`);
        return false;
    }
}

async function runTests() {
    for (const model of modelsToTest) {
        const success = await testModel(model);
        if (success) {
            console.log(`\n🎉 Found working model: ${model}`);
            break;
        }
    }
}

runTests();
