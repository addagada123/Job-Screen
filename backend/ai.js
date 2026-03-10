// AI evaluation and question generation endpoint for JobScreen
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

// Load API keys from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Helper: OpenAI ---
async function askOpenAI(prompt, language = "English") {
  const systemPrompt = `You are an expert interviewer. All responses must be in ${language}.`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 256
  });
  return response.choices[0].message.content;
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
  const { prompt, model = "openai", skills = [], language = "English", type = "question", questionText = "" } = req.body;
  try {
    let aiText = "";
    let usedPrompt = prompt;
    // If generating a question
    if (type === "question") {
      if (skills.length > 0) {
        usedPrompt = `Generate a single interview question relevant to these skills: ${skills.join(", ")}. Respond ONLY with valid JSON exactly like this: {"text": "question string", "category": "category string"}. Do not include markdown formatting.`;
      } else {
        usedPrompt = `Generate a single general interview question. Respond ONLY with valid JSON exactly like this: {"text": "question string", "category": "category string"}. Do not include markdown formatting.`;
      }
    }
    // If evaluating, include language and context
    if (type === "evaluation") {
      usedPrompt = `You are evaluating an interview answer.
Question Context: "${questionText || 'General interview question'}"
Candidate's Answer: "${prompt}"
Language used: ${language}

Task: Determine how relevant the candidate's answer is to the context of the question. 
Respond ONLY with valid JSON exactly like this:
{
  "relevancy": <number between 0 and 100>,
  "aiText": "<brief feedback in ${language}>"
}
Do not include any other text or markdown block markers.`;
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

    // Clean any potential markdowns from aiText payload
    let cleanAiText = aiText.trim();
    if (cleanAiText.startsWith("```json")) cleanAiText = cleanAiText.replace(/^```json/, "").replace(/```$/, "").trim();
    else if (cleanAiText.startsWith("```")) cleanAiText = cleanAiText.replace(/^```/, "").replace(/```$/, "").trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanAiText);
    } catch (e) {
      console.warn("Failed to parse JSON from AI, attempting rough extraction:", cleanAiText);
      // Fallback
      if (type === "question") {
        parsedResult = { text: aiText, category: "General" };
      } else {
        parsedResult = { relevancy: 0, aiText: aiText };
      }
    }

    if (type === "evaluation") {
      const relevancy = typeof parsedResult.relevancy === "number" ? parsedResult.relevancy : 0;
      const isCorrect = relevancy >= 70;
      res.json({
        relevancy,
        correctness: isCorrect,
        score: isCorrect ? 1 : 0,
        aiText: parsedResult.aiText || ""
      });
    } else {
      // Return generated question JSON
      res.json(parsedResult);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
