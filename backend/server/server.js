// Admin: get all users (with test/selection status)
app.get('/api/admin/users', (req, res) => {
	// Simple admin check: ?admin=1 (replace with real auth in production)
	if (req.query.admin !== '1') return res.status(403).json({ error: 'Forbidden' });
	let users = loadUsers();
	res.json(users);
});
const USERS_PATH = require('path').join(__dirname, '../data/users.json');

// Helper: load/save users
function loadUsers() {
	try {
		if (fs.existsSync(USERS_PATH)) {
			return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
		}
	} catch (e) {}
	return [];
}
function saveUsers(users) {
	fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
	const { name, email, password, requestAdmin } = req.body;
	if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
	let users = loadUsers();
	if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
	users.push({ name, email, password, isAdmin: false, approved: !requestAdmin, requestAdmin: !!requestAdmin, canTakeTest: true, testTaken: false, selection: null });
	saveUsers(users);
	if (requestAdmin) {
		return res.json({ message: 'wait for admin to approve you', pending: true });
	}
	res.json({ message: 'Signup successful', pending: false });
});

// Login endpoint
app.post('/api/login', (req, res) => {
	const { email, password } = req.body;
	let users = loadUsers();
	const user = users.find(u => u.email === email && u.password === password);
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	if (user.requestAdmin && !user.approved) return res.status(403).json({ error: 'Wait for admin to approve you' });
	res.json({ name: user.name, email: user.email, isAdmin: user.isAdmin, canTakeTest: user.canTakeTest, testTaken: user.testTaken, selection: user.selection });
});

// Admin: get pending requests
app.get('/api/admin/requests', (req, res) => {
	let users = loadUsers();
	const pending = users.filter(u => u.requestAdmin && !u.approved);
	res.json(pending);
});

// Admin: approve/reject request
app.post('/api/admin/approve', (req, res) => {
	const { email, approve } = req.body;
	let users = loadUsers();
	const user = users.find(u => u.email === email);
	if (!user) return res.status(404).json({ error: 'User not found' });
	if (approve) {
		user.approved = true;
		user.isAdmin = true;
	} else {
		user.approved = false;
		user.isAdmin = false;
		user.requestAdmin = false;
	}
	saveUsers(users);
	res.json({ success: true });
});

// Mark test as taken (enforce one test per user)
app.post('/api/mark-test-taken', (req, res) => {
	const { email } = req.body;
	let users = loadUsers();
	const user = users.find(u => u.email === email);
	if (!user) return res.status(404).json({ error: 'User not found' });
	if (user.testTaken) return res.status(400).json({ error: 'Test already taken' });
	user.testTaken = true;
	saveUsers(users);
	res.json({ success: true });
});

// Admin: set selection status (select/reject) for user
app.post('/api/admin/select', (req, res) => {
	const { email, selection } = req.body; // selection: 'selected' | 'rejected' | null
	let users = loadUsers();
	const user = users.find(u => u.email === email);
	if (!user) return res.status(404).json({ error: 'User not found' });
	user.selection = selection;
	saveUsers(users);
	res.json({ success: true });
});

// Get user status (for result message)
app.get('/api/user-status', (req, res) => {
	const { email } = req.query;
	let users = loadUsers();
	const user = users.find(u => u.email === email);
	if (!user) return res.status(404).json({ error: 'User not found' });
	res.json({ selection: user.selection });
});
const fs = require('fs');
const SCORES_PATH = require('path').join(__dirname, '../data/scores.json');

// Save user score endpoint
app.post('/api/submit-score', (req, res) => {
	const { user, score, relevancy, correctness, totalQuestions } = req.body;
	if (!user || typeof score !== 'number') {
		return res.status(400).json({ error: 'Missing user or score' });
	}
	let scores = [];
	try {
		if (fs.existsSync(SCORES_PATH)) {
			scores = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
		}
	} catch (e) { scores = []; }
	scores.push({ user, score, relevancy, correctness, totalQuestions, date: new Date().toISOString() });
	fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2));
	res.json({ success: true });
});

// Get all scores (admin only)
app.get('/api/scores', (req, res) => {
	// Simple admin check: ?admin=1 (replace with real auth in production)
	if (req.query.admin !== '1') return res.status(403).json({ error: 'Forbidden' });
	let scores = [];
	try {
		if (fs.existsSync(SCORES_PATH)) {
			scores = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'));
		}
	} catch (e) { scores = []; }
	// Sort by score descending
	scores.sort((a, b) => b.score - a.score);
	res.json(scores);
});
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// DeepSeek API endpoint
app.post('/api/deepseek', async (req, res) => {
	try {
		const { prompt } = req.body;
		const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 500
			})
		});
		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res) => {
	try {
		const { prompt } = req.body;
		const apiKey = process.env.GEMINI_API_KEY;
		const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
		});
		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// OpenAI API endpoint
app.post('/api/openai', async (req, res) => {
	try {
		const { prompt } = req.body;
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 500
			})
		});
		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Evaluation endpoint

// Helper to extract context relevancy, correctness, and score from AI response
function parseEvaluation(aiText) {
	// Simple heuristics: look for numbers/keywords in the AI response
	// Example expected format: "Context Relevancy: 85%. Correctness: Yes."
	let relevancy = null, correctness = null, score = null;
	const relMatch = aiText.match(/relevancy\s*[:\-]?\s*(\d{1,3})%?/i);
	if (relMatch) relevancy = parseInt(relMatch[1]);
	const correctMatch = aiText.match(/correct(ness)?\s*[:\-]?\s*(yes|no|true|false)/i);
	if (correctMatch) correctness = /yes|true/i.test(correctMatch[2]);
	// Score: if relevancy >= 70 and correctness true, score = 1, else 0
	if (relevancy !== null && correctness !== null) {
		score = (relevancy >= 70 && correctness) ? 1 : 0;
	}
	return { relevancy, correctness, score };
}

app.post('/api/evaluate', async (req, res) => {
	try {
		const { prompt, model } = req.body;
		let apiUrl, headers, body;
		if (model === 'openai') {
			apiUrl = 'https://api.openai.com/v1/chat/completions';
			headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
			};
			body = JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 500
			});
		} else if (model === 'gemini') {
			apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
			headers = { 'Content-Type': 'application/json' };
			body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
		} else if (model === 'deepseek') {
			apiUrl = 'https://api.deepseek.com/v1/chat/completions';
			headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
			};
			body = JSON.stringify({
				model: 'deepseek-chat',
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 500
			});
		} else {
			return res.status(400).json({ error: 'Invalid model' });
		}
		const response = await fetch(apiUrl, { method: 'POST', headers, body });
		const data = await response.json();

		// Extract AI text from response
		let aiText = '';
		if (model === 'openai' && data.choices && data.choices[0]) {
			aiText = data.choices[0].message.content;
		} else if (model === 'gemini' && data.candidates && data.candidates[0]) {
			aiText = data.candidates[0].content.parts[0].text;
		} else if (model === 'deepseek' && data.choices && data.choices[0]) {
			aiText = data.choices[0].message.content;
		} else {
			aiText = JSON.stringify(data);
		}

		const { relevancy, correctness, score } = parseEvaluation(aiText);
		res.json({ aiText, relevancy, correctness, score });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const multer = require('multer');
const upload = multer({ dest: require('path').join(__dirname, '../uploads') });

// Resume upload endpoint
app.post('/api/upload-resume', upload.single('resume'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}
	res.json({ message: 'Resume uploaded successfully', filename: req.file.filename, originalname: req.file.originalname });
});

const path = require('path');

// Serve static files from frontend build (for production)
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Serve index.html at root
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Proxy running on port ${PORT}`));
