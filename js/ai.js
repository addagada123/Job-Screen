// AI Module for Dynamic Question Generation
// Using backend proxy to hide API keys

var USE_AI = true; // Set to true to enable AI generation
var PROXY_URL = 'http://localhost:3000';
var AI_PROVIDERS = ['deepseek', 'gemini', 'openai']; // Order of preference

// Fallback question bank (used when AI fails)
var fallbackQuestions = {
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

// Generate questions using AI (via proxy)
function generateQuestionsWithAI(category, count, callback) {
    if (!USE_AI) {
        callback(getFallbackQuestions(category, count));
        return;
    }
    
    var categoryNames = {
        plumbing: 'Plumbing',
        masonry: 'Masonry',
        driving: 'Driving',
        electrical: 'Electrical',
        carpentry: 'Carpentry',
        painting: 'Painting'
    };
    
    var categoryName = categoryNames[category] || 'General';
    
    var prompt = 'Generate ' + count + ' job interview questions for a ' + categoryName + ' position suitable for a blue collar worker. ' +
        'For each question, provide: the question text and 4-5 keywords that would indicate a correct answer. ' +
        'Return as JSON array with format: [{id, question, keywords:[], difficulty}] ' +
        'Make questions practical and related to real job scenarios. ' +
        'Return ONLY the JSON array, no other text.';
    
    // Try all providers in parallel, use the first successful response
    var fetches = AI_PROVIDERS.map(function(provider) {
        return fetch(PROXY_URL + '/api/' + provider, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            var content = '';
            if (provider === 'gemini' && data.candidates && data.candidates[0]) {
                content = data.candidates[0].content.parts[0].text;
            } else if (data.choices && data.choices[0] && data.choices[0].message) {
                content = data.choices[0].message.content;
            }
            if (content) {
                var jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            throw new Error('No valid content');
        });
    });
    Promise.any(fetches)
        .then(function(questions) { callback(questions); })
        .catch(function() {
            callback(getFallbackQuestions(category, count));
        });
}

// Get fallback questions from local bank
function getFallbackQuestions(category, count) {
    var questions = fallbackQuestions[category] || fallbackQuestions.plumbing;
    var shuffled = [];
    var indices = [];
    for (var i = 0; i < questions.length; i++) { indices.push(i); }
    for (var j = indices.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var temp = indices[j]; indices[j] = indices[k]; indices[k] = temp;
    }
    for (var l = 0; l < Math.min(count, questions.length); l++) {
        shuffled.push(questions[indices[l]]);
    }
    return shuffled;
}

// Evaluate answer using AI (via proxy)
function evaluateAnswerWithAI(answer, question, callback) {
    if (!USE_AI) { callback(null); return; }
    
    var prompt = 'Evaluate this job interview answer. Question: "' + question.question + '". ' +
        'Answer: "' + answer + '". ' +
        'Keywords to look for: ' + question.keywords.join(', ') + '. ' +
        'Return a JSON with: {score: 0-100, feedback: "short feedback", isRelevant: true/false}. ' +
        'Return ONLY the JSON.';
    
    // Try all providers in parallel, use the first successful response
    var fetches = AI_PROVIDERS.map(function(provider) {
        return fetch(PROXY_URL + '/api/' + provider, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            var content = '';
            if (provider === 'gemini' && data.candidates && data.candidates[0]) {
                content = data.candidates[0].content.parts[0].text;
            } else if (data.choices && data.choices[0]) {
                content = data.choices[0].message.content;
            }
            if (content) {
                var jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) { return JSON.parse(jsonMatch[0]); }
            }
            throw new Error('No valid content');
        });
    });
    Promise.any(fetches)
        .then(function(result) { callback(result); })
        .catch(function() { callback(null); });
}

function getAIQuestion(category, callback) {
    generateQuestionsWithAI(category, 1, function(questions) {
        if (questions && questions.length > 0) { callback(questions[0]); }
        else { callback(getFallbackQuestions(category, 1)[0]); }
    });
}

window.aiModule = {
    generateQuestionsWithAI: generateQuestionsWithAI,
    evaluateAnswerWithAI: evaluateAnswerWithAI,
    getAIQuestion: getAIQuestion,
    getFallbackQuestions: getFallbackQuestions
};
