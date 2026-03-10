const SKILLS = [
  "plumbing",
  "pipe fitting",
  "electrician",
  "carpentry",
  "masonry",
  "welding",
  "driver",
  "forklift",
  "construction",
  "tiling",
  "roofing"
];

function extractSkills(text) {
  const found = [];
  const lower = text.toLowerCase();
  for (const skill of SKILLS) {
    if (lower.includes(skill)) {
      found.push(skill);
    }
  }
  return found;
}

module.exports = extractSkills;
