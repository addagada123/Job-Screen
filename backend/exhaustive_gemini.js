const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function exhaustiveGeminiTest() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  const modelsToTry = [
    "gemini-1.5-flash", 
    "gemini-1.5-flash-latest", 
    "gemini-1.5-pro", 
    "gemini-1.5-pro-latest", 
    "gemini-pro",
    "gemini-1.0-pro"
  ];
  
  console.log(`Testing Gemini Key: ${key.substring(0, 10)}...`);

  for (const m of modelsToTry) {
    try {
      console.log(`Trying model: ${m}`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hi");
      console.log(`MATCH! Model ${m} works. Result: ${result.response.text().substring(0, 5)}`);
      return;
    } catch (e) {
      console.log(`Model ${m} failed: ${e.message}`);
    }
  }
  console.log("All known Gemini models failed for this key.");
}

exhaustiveGeminiTest();
