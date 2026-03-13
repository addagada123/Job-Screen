const fetch = require('node-fetch');

async function runTest(skills, label) {
    console.log(`\n>>> Testing Category: ${label} (Skills: ${skills.join(", ")})`);
    try {
        const res = await fetch('http://localhost:5000/api/evaluate', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "question",
                skills: skills,
                language: "English"
            })
        });

        if (!res.ok) {
            console.error(`Error: Server responded with status ${res.status}`);
            return;
        }

        const data = await res.json();
        console.log(`Captured AI Response for ${label}:`);
        console.log(`Question: ${data.text}`);
        console.log(`Category: ${data.category}`);

        // Simple check for relevance
        const text = data.text.toLowerCase();
        const keywords = skills.map(s => s.toLowerCase());
        const isLikelyRelevant = keywords.some(kw => text.includes(kw)) || 
                                 (label === "Plumbing" && (text.includes("pipe") || text.includes("leak") || text.includes("drain"))) ||
                                 (label === "Electrician" && (text.includes("wire") || text.includes("circuit") || text.includes("voltage")));

        if (isLikelyRelevant) {
            console.log(`✅ Result appears RELEVANT to ${label}.`);
        } else {
            console.log(`❌ Result might NOT be relevant to ${label}. Please review.`);
        }
    } catch (e) {
        console.error(`Network or Server Error: ${e.message}`);
    }
}

async function verifyAIModels() {
    console.log("=========================================");
    console.log("Starting Comprehensive AI Verification");
    console.log("=========================================");

    await runTest(["plumbing"], "Plumbing");
    await runTest(["electrician", "wiring"], "Electrician");

    console.log("\n=========================================");
    console.log("AI Verification Completed");
    console.log("=========================================");
}

verifyAIModels();
