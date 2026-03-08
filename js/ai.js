// AI Module for Dynamic Question Generation
// Using DeepSeek API

// IMPORTANT: Insert your DeepSeek API key here for local development only. Do NOT commit real keys.
var DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY_HERE';
var DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Fallback question banks (used if API fails)
var fallbackQuestions = {
    plumbing: [
        { id: 'plum1', question: 'What is the standard slope for drain pipes?', keywords: ['1/4', 'slope', 'inch', 'foot'], difficulty: 'basic' },
        { id: 'plum2', question: 'How do you fix a leaky pipe under the sink?', keywords: ['wrench', 'plumber tape', 'seal', 'replace'], difficulty: 'intermediate' },
        { id: 'plum3', question: 'What type of pipe is best for drinking water?', keywords: ['cpvc', 'pvc', 'copper', 'pex', 'lead-free'], difficulty: 'basic' },
        { id: 'plum4', question: 'How do you unclog a drain without chemicals?', keywords: ['plunger', 'snake', 'baking soda', 'vinegar'], difficulty: 'intermediate' },
        { id: 'plum5', question: 'What is the purpose of a P-trap?', keywords: ['trap', 'smell', 'sewer', 'gas', 'prevent'], difficulty: 'intermediate' }
    ],
    masonry: [
        { id: 'mas1', question: 'What is the correct mix ratio for cement mortar?', keywords: ['1:3', 'sand', 'cement', 'ratio'], difficulty: 'basic' },
        { id: 'mas2', question: 'How do you lay bricks properly?', keywords: ['level', 'plumb', 'joint', 'mortar', 'bed'], difficulty: 'intermediate' },
        { id: 'mas3', question: 'What is curing and why is it important?', keywords: ['water', 'moisture', 'strength', 'concrete'], difficulty: 'basic' },
        { id: 'mas4', question: 'How do you fix cracked tiles?', keywords: ['remove', 'replace', 'grout', 'adhesive'], difficulty: 'intermediate' },
        { id: 'mas5', question: 'What tools are needed for basic masonry?', keywords: ['trowel', 'hammer', 'chisel', 'level'], difficulty: 'basic' }
    ],
    driving: [
        { id: 'drv1', question: 'What should you check before a long drive?', keywords: ['tire', 'oil', 'water', 'brakes', 'fuel'], difficulty: 'basic' },
        { id: 'drv2', question: 'How do you handle a tire blowout?', keywords: ['grip', 'steering', 'brake', 'control', 'pull'], difficulty: 'advanced' },
        { id: 'drv3', question: 'What is the safe following distance on highway?', keywords: ['seconds', '3', '4', 'distance', 'speed'], difficulty: 'basic' },
        { id: 'drv4', question: 'How do you parallel park correctly?', keywords: ['mirror', 'signal', 'turn', 'space', 'align'], difficulty: 'intermediate' },
        { id: 'drv5', question: 'What should you do if you feel drowsy?', keywords: ['stop', 'rest', 'coffee', 'break', 'park'], difficulty: 'basic' }
    ],
    electrical: [
        { id: 'elec1', question: 'What must you do before electrical work?', keywords: ['power', 'off', 'switch', 'breaker', 'disconnect'], difficulty: 'basic' },
        { id: 'elec2', question: 'What does a circuit breaker do?', keywords: ['protect', 'overload', 'trip', 'current', 'fire'], difficulty: 'basic' },
        { id: 'elec3', question: 'How do you test if a wire is live?', keywords: ['meter', 'tester', 'voltage', 'probe'], difficulty: 'intermediate' },
        { id: 'elec4', question: 'Difference between live, neutral, ground?', keywords: ['live', 'neutral', 'ground', 'earth', 'return'], difficulty: 'intermediate' },
        { id: 'elec5', question: 'How do you install a new outlet?', keywords: ['wire', 'connect', 'screw', 'box', 'ground'], difficulty: 'advanced' }
    ],
    carpentry: [
        { id: 'carp1', question: 'What is standard door handle height?', keywords: ['36', 'inches', 'height', 'door'], difficulty: 'basic' },
        { id: 'carp2', question: 'How do you measure and cut wood accurately?', keywords: ['measure', 'mark', 'cut', 'square', 'saw'], difficulty: 'basic' },
        { id: 'carp3', question: 'Types of wood joints in furniture?', keywords: ['dovetail', 'mortise', 'tenon', 'butt', 'joint'], difficulty: 'intermediate' },
        { id: 'carp4', question: 'How do you finish wood smoothly?', keywords: ['sand', 'stain', 'varnish', 'paint', 'polish'], difficulty: 'intermediate' },
        { id: 'carp5', question: 'Purpose of pilot hole for screws?', keywords: ['pilot', 'hole', 'prevent', 'split', 'wood'], difficulty: 'basic' }
    ],
    painting: [
        { id: 'pnt1', question: 'Proper order for painting a room?', keywords: ['ceiling', 'wall', 'trim', 'first', 'order'], difficulty: 'basic' },
        { id: 'pnt2', question: 'How to prepare walls before painting?', keywords: ['clean', 'sand', 'patch', 'prime', 'fill'], difficulty: 'basic' },
        { id: 'pnt3', question: 'Oil-based vs water-based paint difference?', keywords: ['oil', 'water', 'dry', 'cleanup', 'finish'], difficulty: 'intermediate' },
        { id: 'pnt4', question: 'How do you cut in edges?', keywords: ['brush', 'edge', 'line', 'corner', 'precision'], difficulty: 'intermediate' },
        { id: 'pnt5', question: 'What causes paint to bubble or peel?', keywords: ['moisture', 'humidity', 'surface', 'primer', 'dirt'], difficulty: 'intermediate' }
    ]
};

// Generate questions using AI
function generateQuestionsWithAI(category, count, callback) {
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
    
    fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a job interview question generator.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.choices && data.choices[0] && data.choices[0].message) {
            try {
                var content = data.choices[0].message.content;
                // Extract JSON from response
                var jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    var questions = JSON.parse(jsonMatch[0]);
                    callback(questions);
                    return;
                }
            } catch (e) {
                console.error('Parse error:', e);
            }
        }
        // Fallback to local questions
        callback(getFallbackQuestions(category, count));
    })
    .catch(function(error) {
        console.error('AI generation error:', error);
        callback(getFallbackQuestions(category, count));
    });
}

// Get fallback questions from local bank
function getFallbackQuestions(category, count) {
    var questions = fallbackQuestions[category] || fallbackQuestions.plumbing;
    
    // Shuffle
    var shuffled = [];
    var indices = [];
    for (var i = 0; i < questions.length; i++) {
        indices.push(i);
    }
    for (var j = indices.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var temp = indices[j];
        indices[j] = indices[k];
        indices[k] = temp;
    }
    for (var l = 0; l < Math.min(count, questions.length); l++) {
        shuffled.push(questions[indices[l]]);
    }
    return shuffled;
}

// Evaluate answer using AI (optional - can enhance current evaluation)
function evaluateAnswerWithAI(answer, question, callback) {
    var prompt = 'Evaluate this job interview answer. Question: "' + question.question + '". ' +
        'Answer: "' + answer + '". ' +
        'Keywords to look for: ' + question.keywords.join(', ') + '. ' +
        'Return a JSON with: {score: 0-100, feedback: "short feedback", isRelevant: true/false}. ' +
        'Return ONLY the JSON.';
    
    fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a job interview answer evaluator.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.choices && data.choices[0]) {
            try {
                var content = data.choices[0].message.content;
                var jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    callback(JSON.parse(jsonMatch[0]));
                    return;
                }
            } catch (e) {
                console.error('Parse error:', e);
            }
        }
        callback(null);
    })
    .catch(function(error) {
        console.error('AI evaluation error:', error);
        callback(null);
    });
}

// Get AI-generated question (for dynamic testing)
function getAIQuestion(category, callback) {
    generateQuestionsWithAI(category, 1, function(questions) {
        if (questions && questions.length > 0) {
            callback(questions[0]);
        } else {
            callback(getFallbackQuestions(category, 1)[0]);
        }
    });
}

// Export functions
window.aiModule = {
    generateQuestionsWithAI: generateQuestionsWithAI,
    evaluateAnswerWithAI: evaluateAnswerWithAI,
    getAIQuestion: getAIQuestion,
    getFallbackQuestions: getFallbackQuestions
};

