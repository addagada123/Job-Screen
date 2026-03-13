const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testProvider(modelName) {
    console.log(`\n=========================================`);
    console.log(`Testing AI Provider: ${modelName.toUpperCase()}`);
    console.log(`=========================================`);

    // 1. Test Question Generation
    try {
        console.log(`>>> [${modelName}] Testing Question Generation...`);
        const qRes = await fetch(`${API_BASE}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "question",
                skills: ["plumbing"],
                model: modelName
            })
        });
        const qData = await qRes.json();
        if (qData.text) {
            console.log(`✅ [${modelName}] Question Gen SUCCESS: ${qData.text.substring(0, 50)}...`);
        } else {
            console.log(`❌ [${modelName}] Question Gen FAILED:`, qData);
        }
    } catch (e) {
        console.log(`❌ [${modelName}] Question Gen ERROR: ${e.message}`);
    }

    // 2. Test Evaluation
    try {
        console.log(`>>> [${modelName}] Testing Answer Evaluation...`);
        const eRes = await fetch(`${API_BASE}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "evaluation",
                questionText: "How do you fix a leaky pipe?",
                prompt: "I use a wrench to tighten the fitting or apply thread tape.",
                model: modelName
            })
        });
        const eData = await eRes.json();
        if (eData.relevancy !== undefined) {
            console.log(`✅ [${modelName}] Evaluation SUCCESS: Relevancy=${eData.relevancy}%, Score=${eData.score}`);
        } else {
            console.log(`❌ [${modelName}] Evaluation FAILED:`, eData);
        }
    } catch (e) {
        console.log(`❌ [${modelName}] Evaluation ERROR: ${e.message}`);
    }
}

async function verifyAllAIs() {
    const providers = ["openai", "gemini", "deepseek"];
    for (const p of providers) {
        await testProvider(p);
    }
    console.log("\n=========================================");
    console.log("Multi-AI Verification Completed");
    console.log("=========================================");
}

verifyAllAIs();
