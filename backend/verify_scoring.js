const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
const TEST_EMAIL = 'test_user_scoring@example.com';

async function testScoring() {
    console.log("=========================================");
    console.log("Starting Scoring & Evaluation Verification");
    console.log("=========================================");

    try {
        // 1. Test Evaluation (Correct Answer Simulation)
        console.log("\n>>> Step 1: Testing Evaluation (Correct Answer)");
        const evalResCorrect = await fetch(`${API_BASE}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "evaluation",
                questionText: "What are the safety protocols for fixing a leak in a pressurized pipe?",
                prompt: "I would first shut off the main water valve to release pressure, then use appropriate protective gear like gloves and goggles before inspecting for cracks.",
                language: "English"
            })
        });
        const evalDataCorrect = await evalResCorrect.json();
        console.log("Correct Answer Result:", evalDataCorrect);
        if (evalDataCorrect.correctness === true && evalDataCorrect.score === 1) {
            console.log("✅ Evaluation logic for correct answer works.");
        } else {
            console.log("❌ Evaluation logic for correct answer failed.");
        }

        // 2. Test Evaluation (Incorrect/Irrelevant Answer Simulation)
        console.log("\n>>> Step 2: Testing Evaluation (Irrelevant Answer)");
        const evalResWrong = await fetch(`${API_BASE}/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "evaluation",
                questionText: "What are the safety protocols for fixing a leak in a pressurized pipe?",
                prompt: "I like to eat pizza while watching movies on weekends.",
                language: "English"
            })
        });
        const evalDataWrong = await evalResWrong.json();
        console.log("Irrelevant Answer Result:", evalDataWrong);
        if (evalDataWrong.correctness === false && evalDataWrong.score === 0) {
            console.log("✅ Evaluation logic for irrelevant answer works.");
        } else {
            console.log("❌ Evaluation logic for irrelevant answer failed.");
        }

        // 3. Test Update Score Endpoint
        console.log("\n>>> Step 3: Testing Score Update Persistence");
        // Note: This requires the user to exist in the DB. 
        // We'll use a known email or just check the response.
        const updateRes = await fetch(`${API_BASE}/update-score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "bhanu@gmail.com", // Using an email likely to exist based on logs
                score: 8
            })
        });
        const updateData = await updateRes.json();
        console.log("Update Score Response:", updateData);
        if (updateData.success) {
            console.log("✅ Score update endpoint returned success.");
        } else {
            console.log("❌ Score update endpoint failed:", updateData.error);
        }

    } catch (e) {
        console.error("Error during verification:", e.message);
    }

    console.log("\n=========================================");
    console.log("Scoring Verification Completed");
    console.log("=========================================");
}

testScoring();
