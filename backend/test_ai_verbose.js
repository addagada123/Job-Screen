const fetch = require('node-fetch');

async function testAIGenerationVerbose() {
  const skills = ["plumbing"];
  const language = "English";
  
  console.log("Starting Verbose Automating AI Test...\n");

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
    
    // We already know it returns 500 error: 'All AI models failed...'
    // Let's fetch text to see error.
    const text = await res.text();
    console.log("Server Response:", text);
    
  } catch (e) {
    console.log("Network/Server Error:", e.message);
  }
}

testAIGenerationVerbose();
