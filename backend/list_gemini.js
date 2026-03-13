const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the simple SDK easily, 
    // but we can try to hit a known one.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            console.log(`Model ${m} WORKS! Result: ${result.response.text().substring(0, 10)}`);
            return;
        } catch (e) {
            console.log(`Model ${m} failed: ${e.message}`);
        }
    }
  } catch (e) {
    console.log("General error:", e.message);
  }
}

listModels();
