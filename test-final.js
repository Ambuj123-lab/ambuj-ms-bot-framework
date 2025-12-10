require('dotenv').config();

async function testModel(modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
    };

    console.log(`\nTesting ${modelName}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS!`);
            return true;
        } else {
            console.log(`❌ FAILED. ${data.error?.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function run() {
    await testModel('gemini-1.5-flash-latest');
    await testModel('gemini-1.5-flash-001');
    await testModel('gemini-1.0-pro');
}

run();
