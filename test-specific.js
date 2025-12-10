require('dotenv').config();

async function testModel(modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
    };

    console.log(`\n--- Testing ${modelName} ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS! Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
            return true;
        } else {
            console.log(`❌ FAILED. Status: ${response.status}`);
            console.log(`Error: ${JSON.stringify(data.error, null, 2)}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ NETWORK ERROR: ${error.message}`);
        return false;
    }
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-flash-latest');
    await testModel('gemini-pro');
}

run();
