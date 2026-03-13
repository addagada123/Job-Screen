// Question generation utility: tries AI, falls back to static
// Set VITE_API_BASE to your backend URL (e.g. "/api" or "http://localhost:3000")
const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

export const staticQuestions = [
  // Plumbing
  { text: "What is the primary function of a P-trap in a drainage system?", category: "Plumbing", skill: "plumbing" },
  { text: "How do you identify a gas leak in a residential piping system?", category: "Plumbing / Safety", skill: "plumbing" },
  { text: "What are the common causes of low water pressure in a high-rise building?", category: "Plumbing", skill: "plumbing" },
  { text: "Explain the difference between a gate valve and a ball valve.", category: "Plumbing", skill: "plumbing" },
  { text: "How do you properly solder copper pipes to ensure a leak-proof joint?", category: "Plumbing", skill: "plumbing" },
  
  // Electrical
  { text: "Can you explain the safety difference between a circuit breaker and a fuse?", category: "Electrical", skill: "electrician" },
  { text: "What are the common signs of an overloaded electrical circuit?", category: "Electrical", skill: "electrician" },
  { text: "What is the importance of 'grounding' in an electrical installation?", category: "Electrical", skill: "electrician" },
  { text: "How do you test a circuit for voltage before starting repairs?", category: "Electrical", skill: "electrician" },
  { text: "Explain the purpose of a GFCI (Ground Fault Circuit Interrupter) outlet.", category: "Electrical", skill: "electrician" },
  
  // Logistics / Driver / Forklift
  { text: "What are the key safety checks you perform before operating a forklift?", category: "Safety / Logistics", skill: "forklift" },
  { text: "What is the most important rule to follow when driving a heavy vehicle in rainy conditions?", category: "Driving / Logistics", skill: "driver" },
  { text: "How do you secure a load in a truck to prevent shifting during transport?", category: "Logistics", skill: "driver" },
  { text: "Describe the 'three-point contact' rule for mounting and dismounting heavy machinery.", category: "Logistics / Safety", skill: "forklift" },
  { text: "What should you do if your vehicle's brakes fail while driving on a slope?", category: "Driving / Safety", skill: "driver" },
  
  // Construction / Masonry / Tiling
  { text: "How do you ensure a surface is level before starting masonry or tiling work?", category: "Construction", skill: "masonry" },
  { text: "How do you ensure a surface is level before starting masonry or tiling work?", category: "Construction", skill: "tiling" },
  { text: "What is the correct ratio for mixing cement for a standard brick wall?", category: "Construction", skill: "masonry" },
  { text: "What is the purpose of using 'spacers' when laying floor tiles?", category: "Construction / Tiling", skill: "tiling" },
  { text: "Explain the importance of curing concrete and how long it typically takes.", category: "Construction", skill: "masonry" },
  
  // Welding / Metalwork
  { text: "What tools would you use to measure the thickness of a metal plate for welding?", category: "Welding / Metalwork", skill: "welding" },
  { text: "What are the most common defects found in a weld joint?", category: "Welding", skill: "welding" },
  { text: "Describe the necessary PPE (Personal Protective Equipment) for arc welding.", category: "Welding / Safety", skill: "welding" },
  
  // HVAC / Technician
  { text: "How do you check for a refrigerant leak in an air conditioning unit?", category: "HVAC", skill: "hvac" },
  { text: "What is the function of an evaporator coil in a cooling system?", category: "HVAC", skill: "hvac" },
  { text: "Explain the importance of regular filter changes in a ventilation system.", category: "HVAC", skill: "hvac" },
  
  // General Safety
  { text: "Describe the proper way to lift heavy objects to avoid back injury.", category: "Workplace Safety", skill: "general" },
  { text: "What are the steps to follow if a chemical spill occurs in the workplace?", category: "Workplace Safety", skill: "general" }
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
    
    if (data && data.text && data.category) {
      return data;
    }
    
    throw new Error("AI did not return valid question");
  } catch (err) {
    console.warn("AI generation failed, using skill-based fallback:", err.message);
    
    // Skill-based fallback logic
    if (skills && skills.length > 0) {
      const filtered = staticQuestions.filter(q => 
        skills.some(s => q.skill === s.toLowerCase())
      );
      if (filtered.length > 0) {
        return filtered[Math.floor(Math.random() * filtered.length)];
      }
    }
    
    // Ultimate fallback if no skills match
    return staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
  }
}
