// Mock Data for Job Screen App

const jobCategories = {
    plumbing: { 
        name: 'Plumbing', 
        keywords: ['pipe', 'water', 'drain', 'leak', 'bathroom', 'kitchen', 'fitting', 'valve', 'welding', 'installation', 'repair', 'plumber', 'p-trap', 'vent', 'sewer', 'fixture'] 
    },
    masonry: { 
        name: 'Masonry', 
        keywords: ['brick', 'cement', 'concrete', 'tiles', 'stone', 'wall', 'floor', 'construction', 'mortar', 'plaster', 'block', 'grout', 'trowel', 'foundation'] 
    },
    driving: { 
        name: 'Driving', 
        keywords: ['license', 'vehicle', 'car', 'truck', 'delivery', 'transport', 'route', 'navigation', 'safety', 'traffic', 'cdl', 'defensive', 'parking'] 
    },
    electrical: { 
        name: 'Electrical', 
        keywords: ['wiring', 'circuit', 'panel', 'switch', 'outlet', 'voltage', 'power', 'lighting', 'installation', 'repair', 'breaker', 'ground', 'wire'] 
    },
    carpentry: { 
        name: 'Carpentry', 
        keywords: ['wood', 'furniture', 'cabinet', 'door', 'window', 'frame', 'carpenter', 'joinery', 'cutting', 'sanding', 'saw', 'drill', 'hammer'] 
    },
    painting: { 
        name: 'Painting', 
        keywords: ['paint', 'color', 'wall', 'interior', 'exterior', 'brush', 'roller', 'spray', 'texture', 'finish', 'primer', 'coat', 'stain'] 
    }
};

// Fallback question bank - used when AI is not available
const questionBank = {
    plumbing: [
        { id: 'plum1', question: 'What is the standard slope for drain pipes?', keywords: ['1/4', '1/8', 'quarter', 'inch', 'foot', 'slope', 'gradient', 'fall'], difficulty: 'basic' },
        { id: 'plum2', question: 'How do you fix a leaky pipe under the sink?', keywords: ['wrench', 'plumber tape', 'seal', 'replace', 'tighten', 'nut', 'ferrule', 'washer'], difficulty: 'intermediate' },
        { id: 'plum3', question: 'What type of pipe is best for drinking water?', keywords: ['cpvc', 'pvc', 'copper', 'pex', 'plastic', 'lead-free', 'safe', 'potable'], difficulty: 'basic' },
        { id: 'plum4', question: 'How do you unclog a drain without chemicals?', keywords: ['plunger', 'snake', 'drain auger', 'baking soda', 'vinegar', 'hot water', 'manual'], difficulty: 'intermediate' },
        { id: 'plum5', question: 'What is the purpose of a P-trap?', keywords: ['trap', 'smell', 'sewer', 'gas', 'prevent', 'water seal', 'block', 'odors'], difficulty: 'intermediate' }
    ],
    masonry: [
        { id: 'mas1', question: 'What is the correct mix ratio for cement mortar?', keywords: ['1:3', '1:4', '1:5', 'sand', 'cement', 'ratio', 'proportion', 'mix'], difficulty: 'basic' },
        { id: 'mas2', question: 'How do you lay bricks properly?', keywords: ['level', 'plumb', 'joint', 'mortar', 'bed', 'butter', 'offset', 'stagger'], difficulty: 'intermediate' },
        { id: 'mas3', question: 'What is curing and why is it important?', keywords: ['water', 'moisture', 'strength', 'concrete', 'dry', 'time', 'process', 'hydrate'], difficulty: 'basic' },
        { id: 'mas4', question: 'How do you fix cracked tiles?', keywords: ['remove', 'replace', 'grout', 'adhesive', 'match', 'new tile', 'repair'], difficulty: 'intermediate' },
        { id: 'mas5', question: 'What tools are needed for masonry work?', keywords: ['trowel', 'hammer', 'chisel', 'level', 'mixer', 'brush', 'float'], difficulty: 'basic' }
    ],
    driving: [
        { id: 'drv1', question: 'What should you check before a long drive?', keywords: ['tire', 'oil', 'water', 'brakes', 'fuel', 'lights', 'mirror', 'fluid'], difficulty: 'basic' },
        { id: 'drv2', question: 'How do you handle a tire blowout?', keywords: ['grip', 'steering', 'brake', 'slowly', 'accelerate', 'control', 'pull'], difficulty: 'advanced' },
        { id: 'drv3', question: 'What is the safe following distance?', keywords: ['seconds', '3', '4', 'distance', 'car', 'length', 'highway', 'speed'], difficulty: 'basic' },
        { id: 'drv4', question: 'How do you parallel park?', keywords: ['mirror', 'signal', 'turn', 'space', 'align', 'curb', 'distance', 'check'], difficulty: 'intermediate' },
        { id: 'drv5', question: 'What if you feel drowsy while driving?', keywords: ['stop', 'rest', 'coffee', 'break', 'park', 'sleep', 'switch', 'driver'], difficulty: 'basic' }
    ],
    electrical: [
        { id: 'elec1', question: 'First thing before electrical work?', keywords: ['power', 'off', 'switch', 'circuit', 'breaker', 'disconnect', 'turn off', 'electricity'], difficulty: 'basic' },
        { id: 'elec2', question: 'What does a circuit breaker do?', keywords: ['protect', 'overload', 'trip', 'current', 'fire', 'safety', 'stop', 'break'], difficulty: 'basic' },
        { id: 'elec3', question: 'How do you test if a wire is live?', keywords: ['meter', 'tester', 'voltage', 'probe', 'non-contact', 'multimeter', 'hot'], difficulty: 'intermediate' },
        { id: 'elec4', question: 'Difference between live, neutral, ground?', keywords: ['live', 'hot', 'neutral', 'ground', 'earth', 'return', 'safety', 'voltage'], difficulty: 'intermediate' },
        { id: 'elec5', question: 'How to install a new outlet?', keywords: ['wire', 'connect', 'screw', 'box', 'ground', 'neutral', 'live', 'secure'], difficulty: 'advanced' }
    ],
    carpentry: [
        { id: 'carp1', question: 'Standard height for door handle?', keywords: ['36', 'inches', '36-42', 'waist', 'height', 'door', 'handle', 'standard'], difficulty: 'basic' },
        { id: 'carp2', question: 'How to measure and cut wood accurately?', keywords: ['measure', 'twice', 'mark', 'cut', 'square', 'pencil', 'saw', 'accurate'], difficulty: 'basic' },
        { id: 'carp3', question: 'Types of wood joints in furniture?', keywords: ['dovetail', 'mortise', 'tenon', 'butt', 'dowelled', 'joint', 'frame', 'joinery'], difficulty: 'intermediate' },
        { id: 'carp4', question: 'How to finish wood smoothly?', keywords: ['sand', 'stain', 'varnish', 'paint', 'polish', 'finish', 'smooth', 'coat'], difficulty: 'intermediate' },
        { id: 'carp5', question: 'Purpose of pilot hole for screws?', keywords: ['pilot', 'hole', 'prevent', 'split', 'wood', 'screw', 'guide', 'crack'], difficulty: 'basic' }
    ],
    painting: [
        { id: 'pnt1', question: 'Proper order for painting a room?', keywords: ['ceiling', 'wall', 'trim', 'first', 'last', 'order', 'sequence', 'border'], difficulty: 'basic' },
        { id: 'pnt2', question: 'How to prepare walls before painting?', keywords: ['clean', 'sand', 'patch', 'prime', 'fill', 'repair', 'surface', 'prepare'], difficulty: 'basic' },
        { id: 'pnt3', question: 'Oil-based vs water-based paint?', keywords: ['oil', 'water', 'dry', 'cleanup', 'finish', 'durability', 'smell', 'latex'], difficulty: 'intermediate' },
        { id: 'pnt4', question: 'How to cut in edges when painting?', keywords: ['brush', 'edge', 'line', 'corner', 'tape', 'precision', 'careful', 'detail'], difficulty: 'intermediate' },
        { id: 'pnt5', question: 'What causes paint to bubble or peel?', keywords: ['moisture', 'humidity', 'surface', 'primer', 'dirt', 'warm', 'peel', 'bubble'], difficulty: 'intermediate' }
    ]
};

// Skill keywords for resume parsing
const skillKeywords = [
    // Plumbing
    'pipe fitting', 'drain cleaning', 'water heater', 'gas fitting', 'fixture installation', 'leak detection', 'p-trap', 'venting', 'soldering',
    // Masonry
    'brick laying', 'concrete work', 'tile installation', 'stone work', 'plastering', 'pointing', 'block work', 'stucco',
    // Driving
    'cdl', 'defensive driving', 'route planning', 'vehicle maintenance', 'load securement', 'dot compliance', 'forklift', 'heavy equipment',
    // Electrical
    'wiring', 'panel installation', 'circuit breaker', 'outlet installation', 'lighting', 'electrical repair', 'conduit', 'transformer',
    // Carpentry
    'furniture making', 'cabinet installation', 'door installation', 'window installation', 'framing', 'wood finishing', 'deck building',
    // Painting
    'interior painting', 'exterior painting', 'texture', 'faux finish', 'spray painting', 'color matching', 'drywall', 'spackle'
];

// Sample users for demo
const sampleUsers = [
    { 
        id: 'user1', 
        name: 'Rajesh Kumar', 
        email: 'rajesh@example.com', 
        password: 'password123', 
        role: 'user', 
        resume: { 
            fileName: 'rajesh_plumber.pdf', 
            skills: ['pipe fitting', 'drain cleaning', 'water heater'], 
            jobCategory: 'plumbing' 
        }, 
        tests: [{ 
            id: 'test1', 
            date: '2024-01-15', 
            category: 'plumbing', 
            score: 85, 
            totalQuestions: 5,
            answers: []
        }] 
    },
    { 
        id: 'user2', 
        name: 'Amit Sharma', 
        email: 'amit@example.com', 
        password: 'password123', 
        role: 'user', 
        resume: { 
            fileName: 'amit_electrician.pdf', 
            skills: ['wiring', 'panel installation', 'circuit breaker'], 
            jobCategory: 'electrical' 
        }, 
        tests: [{ 
            id: 'test2', 
            date: '2024-01-14', 
            category: 'electrical', 
            score: 72, 
            totalQuestions: 5,
            answers: []
        }] 
    },
    { 
        id: 'user3', 
        name: 'Suresh Patel', 
        email: 'suresh@example.com', 
        password: 'password123', 
        role: 'user', 
        resume: { 
            fileName: 'suresh_driver.pdf', 
            skills: ['cdl', 'defensive driving', 'route planning'], 
            jobCategory: 'driving' 
        }, 
        tests: [{ 
            id: 'test3', 
            date: '2024-01-13', 
            category: 'driving', 
            score: 90, 
            totalQuestions: 5,
            answers: []
        }] 
    },
    { 
        id: 'user4', 
        name: 'Mohammad Khan', 
        email: 'khan@example.com', 
        password: 'password123', 
        role: 'user', 
        resume: { 
            fileName: 'khan_carpenter.pdf', 
            skills: ['furniture making', 'cabinet installation'], 
            jobCategory: 'carpentry' 
        }, 
        tests: [{ 
            id: 'test4', 
            date: '2024-01-12', 
            category: 'carpentry', 
            score: 65, 
            totalQuestions: 5,
            answers: []
        }] 
    },
    { 
        id: 'user5', 
        name: 'Vikram Singh', 
        email: 'vikram@example.com', 
        password: 'password123', 
        role: 'user', 
        resume: { 
            fileName: 'vikram_mason.pdf', 
            skills: ['brick laying', 'concrete work', 'tile installation'], 
            jobCategory: 'masonry' 
        }, 
        tests: [{ 
            id: 'test5', 
            date: '2024-01-11', 
            category: 'masonry', 
            score: 78, 
            totalQuestions: 5,
            answers: []
        }] 
    }
];

// Export to window
window.mockData = { 
    jobCategories, 
    questionBank, 
    skillKeywords, 
    sampleUsers 
};

