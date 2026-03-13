const fetch = require('node-fetch');

async function testAIGeneration() {
  const skills = ["plumbing"];
  const language = "English";
  let successCount = 0;
  let failCount = 0;
  
  console.log("Starting Automated AI Question Generation Test...");
  console.log(`Target Skills: ${skills.join(", ")}\n`);

  for (let i = 0; i < 5; i++) {
    console.log(`--- Test Run ${i + 1} ---`);
    try {
      const res = await fetch('http://localhost:5000/api/evaluate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          skills: skills,
          language: language
        })
      });
      
      const data = await res.json();
      if (data.text) {
        console.log("SUCCESS! Generated Question:");
        console.log(`Q: ${data.text}`);
        console.log(`Category: ${data.category}\n`);
        successCount++;
      } else {
        console.log("FAILED to generate valid question. Response:", data, "\n");
        failCount++;
      }
    } catch (e) {
      console.log("Network/Server Error:", e.message, "\n");
      failCount++;
    }
  }
  
  console.log(`=== Summary ===`);
  console.log(`Total Runs: 5`);
  console.log(`Successes: ${successCount}`);
  console.log(`Failures: ${failCount}`);
  if (successCount === 5) {
      console.log("AI Generation is perfectly stable.");
  } else {
      console.log("AI Generation experienced issues (might be rate-limiting or parsing errors).");
  }
}

testAIGeneration();
