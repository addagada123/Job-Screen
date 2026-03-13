const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function testAll() {
  console.log("Testing OpenAI...");
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hi" }]
    });
    console.log("OpenAI SUCCESS:", res.choices[0].message.content);
  } catch(e) { console.log("OpenAI ERROR:", e.message); }

  console.log("\nTesting Gemini...");
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hi");
    console.log("Gemini SUCCESS:", result.response.text());
  } catch(e) { console.log("Gemini ERROR:", e.message); }

  console.log("\nTesting DeepSeek...");
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "Say hi" }] })
    });
    if (!res.ok) {
        const text = await res.text();
        console.log("DeepSeek ERROR response:", text);
    } else {
        const data = await res.json();
        console.log("DeepSeek SUCCESS:", data.choices[0].message.content);
    }
  } catch(e) { console.log("DeepSeek ERROR:", e.message); }
}

testAll();
