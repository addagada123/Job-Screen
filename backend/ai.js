// AI evaluation and question generation endpoint for JobScreen
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

// Load API keys from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// --- Helper: OpenAI ---
async function askOpenAI(prompt, language = "English") {
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const systemPrompt = `You are an expert interviewer. All responses must be in ${language}.`;
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 256
  });
  return res.data.choices[0].message.content;
}

// --- Helper: Gemini ---
async function askGemini(prompt, language = "English") {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent([
    { role: "user", parts: [{ text: `Respond in ${language}. ${prompt}` }] }
  ]);
  return result.response.text();
}

// --- Helper: DeepSeek ---
async function askDeepSeek(prompt, language = "English") {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: `All responses must be in ${language}.` },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 256
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

// --- POST /api/evaluate ---
router.post('/evaluate', async (req, res) => {
  const { prompt, model = "openai", skills = [], language = "English", type = "question" } = req.body;
  try {
    let aiText = "";
    let usedPrompt = prompt;
    // If generating a question, include skills
    if (type === "question" && skills.length > 0) {
      usedPrompt = `Generate a single interview question relevant to these skills: ${skills.join(", ")}. Respond as JSON: {text: string, category: string}.`;
    }
    // If evaluating, include language and context
    if (type === "evaluation") {
      usedPrompt = `Evaluate the following answer in ${language}. Consider context, accuracy, and language. ${prompt}`;
    }
    if (model === "openai") {
      aiText = await askOpenAI(usedPrompt, language);
    } else if (model === "gemini") {
      aiText = await askGemini(usedPrompt, language);
    } else if (model === "deepseek") {
      aiText = await askDeepSeek(usedPrompt, language);
    } else {
      return res.status(400).json({ error: "Unknown model" });
    }
    res.json({ aiText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
