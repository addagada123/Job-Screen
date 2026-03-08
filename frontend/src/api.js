// Update user score in backend
export async function updateUserScore(email, score) {
  const res = await fetch(`${API_BASE}/api/update-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, score })
  });
  if (!res.ok) throw new Error("Failed to update score");
  return res.json();
}
// API utility for JobScreen frontend
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function askOpenAI(prompt) {
  const res = await fetch(`${API_BASE}/api/openai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("OpenAI API error");
  return res.json();
}

export async function askGemini(prompt) {
  const res = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("Gemini API error");
  return res.json();
}

export async function askDeepSeek(prompt) {
  const res = await fetch(`${API_BASE}/api/deepseek`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("DeepSeek API error");
  return res.json();
}

export async function evaluateAnswer(prompt, model) {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model })
  });
  if (!res.ok) throw new Error("Evaluation API error");
  return res.json();
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Resume upload failed');
  return res.json();
}

// Add similar functions for other AI endpoints as needed
