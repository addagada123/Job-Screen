// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "";

export const staticQuestions = [
  { text: "Explain the proper procedure for lockout/tagout (LOTO) on industrial equipment.", category: "Safety" },
  { text: "What tools and symbols would you expect to see on a residential electrical blueprint?", category: "Blueprints" },
  { text: "Describe the steps you would take to troubleshoot a motor that is overheating.", category: "Maintenance" },
  { text: "How do you ensure a weld is structurally sound and free of internal voids?", category: "Welding" },
  { text: "What are the common signs of a hydraulic leak in a heavy machinery system?", category: "Diagnostics" },
  { text: "Explain the purpose and function of a circuit breaker in a technical system.", category: "Electrical" },
  { text: "How do you calibrate a laser level for surveying precision?", category: "Construction" },
  { text: "What safety precautions are mandatory when handling pressurized systems?", category: "Safety" },
  { text: "Describe the process for checking the alignment of a belt-driven machine.", category: "Mechanical" },
  { text: "What is the correct way to store hazardous chemicals after a shift?", category: "WHMIS/Safety" },
  { text: "How do you interpret a load chart on a crane or lift?", category: "Rigging" },
  { text: "Describe the difference between series and parallel circuits in troubleshooting.", category: "Electrical" },
  { text: "What tools are essential for measuring internal bore diameters with high precision?", category: "Machining" },
  { text: "How do you identify signs of cavitation in a pump system?", category: "Maintenance" },
  { text: "What is the standard procedure for verifying gas leak detection in a facility?", category: "HVAC/Safety" }
];

export async function generateQuestion(model = "openai", skills = [], language = "English") {
  const token = localStorage.getItem("token");
  const bodyData = { model, skills, language, type: "question" };

  async function tryFetch(m) {
    const res = await fetch(`${API_BASE}/api/evaluate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ...bodyData, model: m })
    });
    if (!res.ok) throw new Error(`Model ${m} failed`);
    return await res.json();
  }

  try {
    // Attempt primary model
    let data;
    try {
      data = await tryFetch(model);
    } catch (err) {
      if (model === "openai") {
        console.warn("Primary AI (OpenAI) failed, attempting failover to Gemini...");
        data = await tryFetch("gemini");
      } else {
        throw err;
      }
    }

    if (data && data.text) {
      return {
        text: data.text,
        category: data.category || "General"
      };
    }
    throw new Error("Invalid AI response structure");
  } catch (err) {
    console.error("Critical AI Error:", err.message);
    // Fallback to the much larger static list
    return staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
  }
}
