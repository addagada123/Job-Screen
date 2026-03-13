// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

export const staticQuestions = [
  { text: "What is the primary function of a P-trap in a drainage system?", category: "Plumbing" },
  { text: "Can you explain the safety difference between a circuit breaker and a fuse?", category: "Electrical" },
  { text: "What are the key safety checks you perform before operating a forklift?", category: "Safety / Logistics" },
  { text: "How do you ensure a surface is level before starting masonry or tiling work?", category: "Construction" },
  { text: "What is the most important rule to follow when driving a heavy vehicle in rainy conditions?", category: "Driving / Logistics" },
  { text: "How do you identify a gas leak in a residential piping system?", category: "Plumbing / Safety" },
  { text: "Describe the proper way to lift heavy objects to avoid back injury.", category: "Workplace Safety" },
  { text: "What tools would you use to measure the thickness of a metal plate for welding?", category: "Welding / Metalwork" }
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
