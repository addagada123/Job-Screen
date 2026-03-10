// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

export const staticQuestions = [
  { text: "What is the purpose of a P-trap?", category: "Plumbing" },
  { text: "Explain the difference between AC and DC current.", category: "Electrical" },
  { text: "How do you calculate the area of a triangle?", category: "Math" },
  { text: "Describe the process of photosynthesis.", category: "Biology" },
  { text: "What is the capital of France?", category: "Geography" },
  { text: "What are the core principles of Object-Oriented Programming?", category: "Software Engineering" },
  { text: "How do you handle conflict in a team environment?", category: "Soft Skills" },
  { text: "What is the difference between a join and a subquery in SQL?", category: "Databases" }
];

export async function generateQuestion(model = "openai", skills = [], language = "English") {
  try {
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, skills, language, type: "question" })
    });
    
    if (!res.ok) throw new Error("AI error");
    const data = await res.json();
    
    // The backend now returns the parsed JSON directly for type: "question"
    if (data && data.text && data.category) {
      return data;
    }
    
    // Fallback if it's still wrapped in aiText (for backward compatibility or safety)
    if (data.aiText) {
      let q;
      try {
        q = JSON.parse(data.aiText);
      } catch {
        const match = data.aiText.match(/\{[\s\S]*\}/);
        if (match) q = JSON.parse(match[0]);
      }
      if (q && q.text && q.category) return q;
    }

    throw new Error("AI did not return valid question");
  } catch (err) {
    console.warn("AI generation failed, using fallback:", err.message);
    return staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
  }
}
