const SKILLS_MAP = {
  "plumbing": ["plumb", "pipe"],
  "electrician": ["electri"],
  "carpentry": ["carpent"],
  "masonry": ["mason"],
  "welding": ["weld"],
  "driver": ["driv"],
  "forklift": ["forklift", "stacker"],
  "construction": ["construct"],
  "tiling": ["tile", "tiling"],
  "roofing": ["roof"],
  "maintenance": ["mainten"],
  "mechanic": ["mechan", "auto", "repair"],
  "warehouse": ["warehous", "logistics"],
  "delivery": ["deliver"],
  "inventory": ["inventor"],
  "cleaning": ["clean", "janitor"],
  "security": ["securit", "guard"],
  "cook": ["cook", "culinary", "chef"],
  "hvac": ["hvac", "air cond"],
  "automotive": ["automotive"]
};

function extractSkills(text) {
  const found = [];
  const lower = text.toLowerCase();
  
  for (const [skill, keywords] of Object.entries(SKILLS_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(skill);
    }
  }
  return found;
}

module.exports = extractSkills;
