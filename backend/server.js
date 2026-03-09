(function () {
	const express = require('express');
	const cors = require('cors');
	const dotenv = require('dotenv');
	const { OAuth2Client } = require('google-auth-library');
	const fs = require('fs');
	const path = require('path');
	dotenv.config();

	const app = express();

	// CORS configuration
	app.use(cors({
		origin: ['http://localhost:5173', 'http://localhost:3300', 'https://your-app.vercel.app'],
		credentials: true
	}));
	app.use(express.json());

	// Google OAuth2 client
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	// JSON file paths
	const usersFilePath = path.join(__dirname, 'data', 'users.json');
	const scoresFilePath = path.join(__dirname, 'data', 'scores.json');

	// Helper functions for JSON file operations
	function readUsers() {
		try {
			if (fs.existsSync(usersFilePath)) {
				const data = fs.readFileSync(usersFilePath, 'utf8');
				return JSON.parse(data);
			}
		} catch (err) {
			console.error('Error reading users:', err);
		}
		return [];
	}

	function writeUsers(users) {
		try {
			fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
		} catch (err) {
			console.error('Error writing users:', err);
		}
	}

	function readScores() {
		try {
			if (fs.existsSync(scoresFilePath)) {
				const data = fs.readFileSync(scoresFilePath, 'utf8');
				return JSON.parse(data);
			}
		} catch (err) {
			console.error('Error reading scores:', err);
		}
		return [];
	}

	function writeScores(scores) {
		try {
			fs.writeFileSync(scoresFilePath, JSON.stringify(scores, null, 2));
		} catch (err) {
			console.error('Error writing scores:', err);
		}
	}

	// Google Sign-In endpoint
	app.post('/api/google-auth', async (req, res) => {
		const { credential } = req.body;
		if (!credential) {
			return res.status(400).json({ error: 'Missing Google credential' });
		}
		try {
			// Verify Google ID token
			const ticket = await client.verifyIdToken({
				idToken: credential,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			const { sub, email, name, picture } = payload;
			const firstName = name.split(' ')[0];

			// Check if user exists in JSON file, else create
			let users = readUsers();
			let user = users.find(u => u.email === email);
			if (!user) {
				user = {
					id: Date.now().toString(),
					googleId: sub,
					email,
					name,
					firstName,
					picture,
					role: 'candidate',
					score: null,
				};
				users.push(user);
				writeUsers(users);
			}

			// Return user info
			res.json({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					firstName: user.firstName,
					picture: user.picture,
					role: user.role,
					score: user.score,
					isAdmin: user.role === 'admin'
				},
			});
		} catch (err) {
			res.status(401).json({ error: 'Invalid Google credential', details: err.message });
		}
	});

	// Endpoint to update user score
	app.post('/api/update-score', async (req, res) => {
		const { email, score } = req.body;
		if (!email || typeof score !== 'number') {
			return res.status(400).json({ error: 'Missing email or score' });
		}
		try {
			let users = readUsers();
			const userIndex = users.findIndex(u => u.email === email);
			if (userIndex === -1) {
				return res.status(404).json({ error: 'User not found' });
			}
			users[userIndex].score = score;
			writeUsers(users);

			// Also update scores.json
			let scores = readScores();
			scores.push({ email, score, date: new Date().toISOString() });
			writeScores(scores);

			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update score', details: err.message });
		}
	});

	// Login endpoint
	app.post('/api/login', async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'Missing email or password' });
		}
		try {
			const users = readUsers();
			const user = users.find(u => u.email === email && u.password === password);
			if (!user) {
				return res.status(401).json({ error: 'Invalid credentials' });
			}
			res.json({
				id: user.id,
				email: user.email,
				name: user.name,
				firstName: user.firstName,
				role: user.role,
				score: user.score,
				isAdmin: user.role === 'admin'
			});
		} catch (err) {
			res.status(500).json({ error: 'Login failed', details: err.message });
		}
	});

	// Signup endpoint
	app.post('/api/signup', async (req, res) => {
		const { name, email, password, requestAdmin } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		try {
			const users = readUsers();
			const existingUser = users.find(u => u.email === email);
			if (existingUser) {
				return res.status(409).json({ error: 'User already exists' });
			}

			const newUser = {
				id: Date.now().toString(),
				name,
				email,
				password,
				firstName: name.split(' ')[0],
				role: requestAdmin ? 'pending_admin' : 'candidate',
				score: null,
				createdAt: new Date().toISOString()
			};

			users.push(newUser);
			writeUsers(users);

			if (requestAdmin) {
				return res.json({ success: true, pending: true, message: 'Admin request pending approval' });
			}

			res.json({ success: true, message: 'Account created successfully' });
		} catch (err) {
			res.status(500).json({ error: 'Signup failed', details: err.message });
		}
	});

	// Get all users (admin)
	app.get('/api/users', async (req, res) => {
		try {
			const users = readUsers();
			res.json(users.map(u => ({
				id: u.id,
				email: u.email,
				name: u.name,
				role: u.role,
				score: u.score
			})));
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch users' });
		}
	});

	// Get all scores (admin)
	app.get('/api/scores', async (req, res) => {
		try {
			const scores = readScores();
			res.json(scores);
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch scores' });
		}
	});

	// Upload resume endpoint
	app.post('/api/upload-resume', async (req, res) => {
		const { email, resumeText } = req.body;
		if (!email || !resumeText) {
			return res.status(400).json({ error: 'Missing email or resume text' });
		}
		try {
			let users = readUsers();
			const userIndex = users.findIndex(u => u.email === email);
			if (userIndex !== -1) {
				users[userIndex].resume = resumeText;
				writeUsers(users);
			}
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to upload resume' });
		}
	});

	// Get resume
	app.get('/api/resume/:email', async (req, res) => {
		try {
			const users = readUsers();
			const user = users.find(u => u.email === req.params.email);
			if (user && user.resume) {
				res.json({ resume: user.resume });
			} else {
				res.json({ resume: null });
			}
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch resume' });
		}
	});

	// Start server
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
})();

