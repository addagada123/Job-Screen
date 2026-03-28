// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "";

export const staticQuestions = [
  {
    text: "Explain the proper procedure for lockout/tagout (LOTO) on industrial equipment.",
    category: "Safety"
  },
  {
    text: "What tools and symbols would you expect to see on a residential electrical blueprint?",
    category: "Blueprints"
  },
  {
    text: "Describe the steps you would take to troubleshoot a motor that is overheating.",
    category: "Maintenance"
  },
  {
    text: "How do you ensure a weld is structurally sound and free of internal voids?",
    category: "Welding"
  },
  {
    text: "What are the common signs of a hydraulic leak in a heavy machinery system?",
    category: "Diagnostics"
  }
];

export async function generateQuestion(model = "openai", skills = [], language = "English") {
  // Try AI first
  try {
    const prompt = "Generate a single interview question with category. Respond as JSON: {text: string, category: string}";
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, model, skills, language, type: "question" })
    });
    if (!res.ok) throw new Error("AI error");
    const data = await res.json();
    
    // The backend now returns the JSON object directly (e.g. { text: "...", category: "..." })
    if (data && data.text && data.category) {
      return data;
    }
    
    throw new Error("AI did not return valid question structure");
  } catch (err) {
    console.warn("AI Question Generation Failed, falling back to static:", err.message);
    // Fallback to static
    return staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
  }
}
