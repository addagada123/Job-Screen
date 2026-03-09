// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const staticQuestions = [
  {
    text: "What is the purpose of a P-trap?",
    category: "Plumbing"
  },
  {
    text: "Explain the difference between AC and DC current.",
    category: "Electrical"
  },
  {
    text: "How do you calculate the area of a triangle?",
    category: "Math"
  },
  {
    text: "Describe the process of photosynthesis.",
    category: "Biology"
  },
  {
    text: "What is the capital of France?",
    category: "Geography"
  }
];

export async function generateQuestion(model = "openai", skills = [], language = "English") {
  // Try AI first
  try {
    const prompt = "Generate a single interview question with category. Respond as JSON: {text: string, category: string}";
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, skills, language, type: "question" })
    });
    if (!res.ok) throw new Error("AI error");
    const data = await res.json();
    // Try to parse JSON from aiText
    let q = null;
    try {
      q = JSON.parse(data.aiText);
    } catch {
      // fallback: try to extract JSON substring
      const match = data.aiText.match(/\{[\s\S]*\}/);
      if (match) q = JSON.parse(match[0]);
    }
    if (q && q.text && q.category) return q;
    throw new Error("AI did not return valid question");
  } catch {
    // Fallback to static
    return staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
  }
}
