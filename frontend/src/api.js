// API utility for JobScreen frontend
// Set VITE_API_BASE to your backend URL in Vercel environment variables
// For production: https://job-screen.onrender.com
// For local development: http://localhost:5000
const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

// Login
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Signup
export async function signup(name, email, password, requestAdmin = false) {
  const res = await fetch(`${API_BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, requestAdmin })
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

// Google Auth
export async function googleAuth(credential, mode) {
  const res = await fetch(`${API_BASE}/api/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, mode })
  });
  if (!res.ok) throw new Error("Google auth failed");
  return res.json();
}

// Get all users (admin)
export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Get all scores (admin)
export async function getAllScores() {
  const res = await fetch(`${API_BASE}/api/scores`);
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}

// Update user score
export async function updateUserScore(email, score) {
  const res = await fetch(`${API_BASE}/api/update-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, score })
  });
  if (!res.ok) throw new Error("Failed to update score");
  return res.json();
}

// Upload resume
export async function uploadResume(email, resumeText) {
  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, resumeText })
  });
  if (!res.ok) throw new Error("Resume upload failed");
  return res.json();
}

// Get resume
export async function getResume(email) {
  const res = await fetch(`${API_BASE}/api/resume/${email}`);
  if (!res.ok) throw new Error("Failed to fetch resume");
  return res.json();
}

// Ask OpenAI
export async function askOpenAI(prompt) {
  const res = await fetch(`${API_BASE}/api/openai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("OpenAI API error");
  return res.json();
}

// Ask Gemini
export async function askGemini(prompt) {
  const res = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("Gemini API error");
  return res.json();
}

// Ask DeepSeek
export async function askDeepSeek(prompt) {
  const res = await fetch(`${API_BASE}/api/deepseek`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("DeepSeek API error");
  return res.json();
}

// Evaluate answer
export async function evaluateAnswer(prompt, model, language = "English") {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model, language, type: "evaluation" })
  });
  if (!res.ok) throw new Error("Evaluation API error");
  return res.json();
}

export default {
  login,
  signup,
  googleAuth,
  getAllUsers,
  getAllScores,
  updateUserScore,
  uploadResume,
  getResume,
  askOpenAI,
  askGemini,
  askDeepSeek,
  evaluateAnswer
};

