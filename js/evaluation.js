// Answer Evaluation Module
function evaluateAnswer(answer, question) {
    if (!answer || answer.trim().length === 0) {
        return { score: 0, matchedKeywords: [], relevance: 'none' };
    }
    
    var answerLower = answer.toLowerCase().trim();
    var keywords = question.keywords || [];
    var matchedKeywords = [];
    var matchScore = 0;
    
    for (var i = 0; i < keywords.length; i++) {
        var keywordLower = keywords[i].toLowerCase();
        if (answerLower.indexOf(keywordLower) !== -1) {
            matchedKeywords.push(keywords[i]);
            matchScore += 10;
        } else {
            var keywordWords = keywordLower.split(' ');
            for (var j = 0; j < keywordWords.length; j++) {
                if (keywordWords[j].length > 3 && answerLower.indexOf(keywordWords[j]) !== -1) {
                    matchedKeywords.push(keywords[i]);
                    matchScore += 5;
                    break;
                }
            }
        }
    }
    
    var contextScore = 0;
    var wordCount = answer.split(/\s+/).length;
    if (wordCount >= 3 && wordCount <= 100) {
        contextScore += 10;
    } else if (wordCount > 100) {
        contextScore += 5;
    }
    
    var actionWords = ['check', 'first', 'use', 'need', 'should', 'must', 'always', 'never', 'step', 'how', 'what', 'why'];
    var hasActionWord = false;
    for (var k = 0; k < actionWords.length; k++) {
        if (answerLower.indexOf(actionWords[k]) !== -1) {
            hasActionWord = true;
            break;
        }
    }
    if (hasActionWord) contextScore += 10;
    
    var hasNumbers = /\d+/.test(answer);
    if (hasNumbers) contextScore += 5;
    
    var totalScore = Math.min(100, matchScore + contextScore);
    
    var relevance;
    if (totalScore >= 70) relevance = 'high';
    else if (totalScore >= 40) relevance = 'medium';
    else if (totalScore > 0) relevance = 'low';
    else relevance = 'none';
    
    return {
        score: totalScore,
        matchedKeywords: matchedKeywords,
        relevance: relevance,
        matchScore: matchScore,
        contextScore: contextScore
    };
}

function evaluateTest(answers, questions) {
    var results = [];
    var totalScore = 0;
    
    for (var i = 0; i < answers.length; i++) {
        var answer = answers[i];
        var question = null;
        for (var j = 0; j < questions.length; j++) {
            if (questions[j].id === answer.questionId) {
                question = questions[j];
                break;
            }
        }
        
        if (question) {
            var evaluation = evaluateAnswer(answer.text, question);
            results.push({
                questionId: answer.questionId,
                question: question.question,
                userAnswer: answer.text,
                evaluation: evaluation
            });
            totalScore += evaluation.score;
        }
    }
    
    var averageScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
    
    return {
        results: results,
        totalScore: totalScore,
        averageScore: averageScore,
        totalQuestions: answers.length
    };
}

function getPerformanceRating(score) {
    if (score >= 90) return { rating: 'Excellent', color: '#10b981' };
    else if (score >= 75) return { rating: 'Good', color: '#00d4ff' };
    else if (score >= 60) return { rating: 'Average', color: '#f59e0b' };
    else if (score >= 40) return { rating: 'Below Average', color: '#ef4444' };
    else return { rating: 'Needs Improvement', color: '#dc2626' };
}

function getRank(users) {
    var sortedUsers = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].tests && users[i].tests.length > 0) {
            var avgScore = calculateAverageScore(users[i].tests);
            sortedUsers.push({
                user: users[i],
                avgScore: avgScore
            });
        }
    }
    
    sortedUsers.sort(function(a, b) { return b.avgScore - a.avgScore; });
    return sortedUsers;
}

function calculateAverageScore(tests) {
    if (!tests || tests.length === 0) return 0;
    var total = 0;
    for (var i = 0; i < tests.length; i++) {
        total += tests[i].score || 0;
    }
    return Math.round(total / tests.length);
}

function getUserRank(userId) {
    var users = getAllUsersWithTests();
    var ranked = getRank(users);
    
    for (var i = 0; i < ranked.length; i++) {
        if (ranked[i].user.id === userId) {
            return i + 1;
        }
    }
    return null;
}

function getAllUsersWithTests() {
    var users = getAllUsers();
    var result = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].tests && users[i].tests.length > 0) {
            result.push(users[i]);
        }
    }
    return result;
}

function generateFeedback(evaluation) {
    var score = evaluation.averageScore;
    var results = evaluation.results;
    
    var feedback = {
        summary: '',
        strengths: [],
        improvements: [],
        tips: []
    };
    
    if (score >= 80) {
        feedback.summary = 'Excellent performance!';
    } else if (score >= 60) {
        feedback.summary = 'Good effort! Room for improvement.';
    } else if (score >= 40) {
        feedback.summary = 'Fair attempt. Study more.';
    } else {
        feedback.summary = 'Keep practicing!';
    }
    
    var highScoring = [];
    for (var i = 0; i < results.length; i++) {
        if (results[i].evaluation.relevance === 'high') {
            highScoring.push(results[i]);
        }
    }
    if (highScoring.length > 0) {
        for (var j = 0; j < Math.min(3, highScoring.length); j++) {
            feedback.strengths.push('Answered: "' + highScoring[j].question.substring(0, 30) + '..."');
        }
    }
    
    var lowScoring = [];
    for (var k = 0; k < results.length; k++) {
        if (results[k].evaluation.relevance === 'low' || results[k].evaluation.relevance === 'none') {
            lowScoring.push(results[k]);
        }
    }
    if (lowScoring.length > 0) {
        for (var m = 0; m < Math.min(3, lowScoring.length); m++) {
            feedback.improvements.push('Need work on: "' + lowScoring[m].question.substring(0, 30) + '..."');
        }
    }
    
    if (score < 70) {
        feedback.tips = [
            'Review fundamentals',
            'Practice answering questions',
            'Be specific with terms',
            'Include numbers when applicable'
        ];
    }
    
    return feedback;
}

