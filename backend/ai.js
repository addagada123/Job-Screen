// AI evaluation and question generation endpoint for JobScreen
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

const jwt = require('jsonwebtoken');

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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Respond in ${language}. ${prompt}`);
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
  if (!res.ok) throw new Error("DeepSeek API error");
  const data = await res.json();
  return data.choices[0].message.content;
}

// --- Multi-Modal Orchestrator with Fallback ---
async function multiModalAsk(prompt, language = "English", forcedModel = null) {
  let models = [
    { name: "openai", fn: askOpenAI },
    { name: "gemini", fn: askGemini },
    { name: "deepseek", fn: askDeepSeek }
  ];

  if (forcedModel && models.find(m => m.name === forcedModel)) {
    console.log(`Forced model requested: ${forcedModel}`);
    const model = models.find(m => m.name === forcedModel);
    return await model.fn(prompt, language);
  }

  models.sort(() => Math.random() - 0.5);
  let lastError = null;
  for (const model of models) {
    try {
      console.log(`Attempting AI request with: ${model.name}`);
      const result = await model.fn(prompt, language);
      console.log(`AI Success for ${model.name}:`, result.substring(0, 50) + "...");
      return result;
    } catch (err) {
      console.error(`AI Error for ${model.name}:`, err.message);
      lastError = err;
    }
  }
  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
}

const JWT_SECRET = process.env.JWT_SECRET || 'jobscreen-super-secret-key-2024';

// Middleware: Authenticate Token 
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ error: 'Authentication required' });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: 'Invalid or expired token' });
		req.user = user;
		next();
	});
};

// --- POST /api/evaluate ---
router.post('/evaluate', authenticateToken, async (req, res) => {
  const { prompt, model = "openai", skills = [], language = "English", type = "question", questionText = "" } = req.body;
  try {
    let aiText = "";
    let usedPrompt = prompt;
    // If generating a question
    if (type === "question") {
      if (skills.length > 0) {
        usedPrompt = `You are a professional technical interviewer for blue-collar and skilled trades. Generate a single HIGHLY TECHNICAL or SITUATIONAL trade interview question relevant STRICTLY and ONLY to these candidate skills: ${skills.join(", ")}. 
        IMPORTANT: The question must be a technical challenge (e.g. tool usage, safety protocol, troubleshooting) about one of these specific trades/skills. Do NOT ask generic behavioral questions (like "describe yourself"). 
        Respond ONLY with valid JSON exactly like this: {"text": "specific technical question", "category": "specific category"}. Do not include markdown formatting.`;
      } else {
        usedPrompt = `You are a professional technical interviewer for skilled labor. Generate a single highly technical situational interview question for a blue-collar role. Respond ONLY with valid JSON exactly like this: {"text": "technical question", "category": "specific category"}. Do not include markdown formatting.`;
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

    // Add random salt to forcing AI variety
    const randomSalt = Math.random().toString(36).substring(7);
    usedPrompt += `\nUniqueness Seed: ${randomSalt}`;

    // Use multiModalAsk for implicit fallback (or forced model if provided)
    aiText = await multiModalAsk(usedPrompt, language, model);

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
      console.log("Success: Returning generated question to client.");
      res.json(parsedResult);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
