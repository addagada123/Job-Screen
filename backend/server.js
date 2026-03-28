require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const extractSkills = require('./skillExtract');
const parseResume = require('./resumeParser');
const { MongoClient, ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'jobscreen-super-secret-key-2024';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
const allowedOrigins = [
	'http://localhost:5173', 
	'http://127.0.0.1:5173', 
	'https://job-screen.onrender.com',
	process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
}));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });


// Middleware to ensure DB is connected
app.use((req, res, next) => {
	if (!db && req.path.startsWith('/api')) {
		return res.status(503).json({ error: 'Database connecting, please try again in a moment' });
	}
	next();
});

// MongoDB setup
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);
let db, usersCollection, scoresCollection, retakeRequestsCollection;

async function connectDb() {
	try {
		await mongoClient.connect();
		db = mongoClient.db('jobscreen');
		usersCollection = db.collection('users');
		scoresCollection = db.collection('scores');
		retakeRequestsCollection = db.collection('retakeRequests');
		
		await usersCollection.createIndex({ email: 1 }, { unique: true });
		await scoresCollection.createIndex({ email: 1 }, { unique: true });
		
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error('MongoDB connection error:', err);
	}
}
connectDb();

// Helper to ensure consistent user objects for frontend
const toUserResponse = (user) => {
	if (!user) return null;
	return {
		id: user._id.toString(),
		email: user.email,
		name: user.name,
		role: user.role,
		testTaken: user.testTaken || false,
		resumeUploaded: !!(user.resume || user.skills?.length > 0),
		selection: user.selection || null,
		isAdmin: user.role === 'admin' || user.isAdmin === true
	};
};

// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ error: 'Authentication required' });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: 'Invalid or expired token' });
		req.user = user;
		next();
	});
};

// Middleware: Is Admin
const isAdmin = (req, res, next) => {
	if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
		next();
	} else {
		res.status(403).json({ error: 'Administrator access required' });
	}
};

	app.get('/api/scores', authenticateToken, isAdmin, async (req, res) => {
		try {
			const scores = await scoresCollection.find({}).toArray();
			// Join with users collection to get proper names and selection status
			const augmentedScores = await Promise.all(scores.map(async (s) => {
				const user = await usersCollection.findOne({ email: s.email });
				return { 
					...s, 
					name: s.name || (user ? user.name : "Unknown Candidate"),
					selection: user ? user.selection : null
				};
			}));
			res.json(augmentedScores);
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch scores', details: err.message });
		}
	});

	// Mark test as taken
	app.post('/api/mark-test-taken', authenticateToken, async (req, res) => {
		let { email } = req.body;
		if (email) email = email.toLowerCase().trim();
		
		// Ownership check
		if (req.user.email !== email && !req.user.isAdmin) {
			return res.status(403).json({ error: 'Unauthorized to update this user' });
		}
		try {
			await usersCollection.updateOne({ email }, { $set: { testTaken: true } });
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to mark test taken' });
		}
	});

	// Update user score
	app.post('/api/update-score', authenticateToken, async (req, res) => {
		let { email, score, language } = req.body;
		if (email) email = email.toLowerCase().trim();

		// Ownership check
		if (req.user.email !== email && !req.user.isAdmin) {
			return res.status(403).json({ error: 'Unauthorized to update this user' });
		}
		try {
			const user = await usersCollection.findOne({ email });
			const name = user ? user.name : "Unknown";
			
			// Update user object with score and language
			await usersCollection.updateOne({ email }, { $set: { score, language, testTaken: true } });
			
			// Upsert into scores collection for history/rankings
			await scoresCollection.updateOne(
				{ email },
				{ $set: { email, name, score, language, date: new Date().toLocaleDateString() } },
				{ upsert: true }
			);
			
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update score' });
		}
	});


	// New upload-resume endpoint (file upload)
	app.post('/upload-resume', authenticateToken, upload.single('resume'), async (req, res) => {
		try {
			const { email } = req.body;
			if (!email) return res.status(400).json({ error: 'Email missing' });
			const trimmedEmail = email.toLowerCase().trim();

			// Ownership check
			if (req.user.email !== trimmedEmail && !req.user.isAdmin) {
				return res.status(403).json({ error: 'Unauthorized to upload for this user' });
			}

			if (!req.file) {
				return res.status(400).json({ error: 'No file uploaded' });
			}
			const text = await parseResume(req.file);
			// Skill extraction
			const skills = extractSkills(text);
			
			// Update user in DB
			await usersCollection.updateOne(
				{ email: trimmedEmail },
				{ $set: { skills, resume: text } }
			);

			res.json({
				success: true,
				resume: text,
				skills,
			});
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	});

	// Get resume
	app.get('/api/resume/:email', authenticateToken, async (req, res) => {
		try {
			const { email } = req.params;
			// Only allow users to see their own resume unless they are an admin
			if (req.user.email !== email && !req.user.isAdmin) {
				return res.status(403).json({ error: 'Access denied' });
			}
			const user = await usersCollection.findOne({ email });
			if (user && user.resume) {
				res.json({ resume: user.resume });
			} else {
				res.json({ resume: null });
			}
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch resume', details: err.message });
		}
	});

	// Get user by ID (admin)
	app.get('/api/user/:id', authenticateToken, isAdmin, async (req, res) => {
		try {
			const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
			if (user) {
				res.json({
					id: user._id.toString(),
					email: user.email,
					name: user.name,
					role: user.role,
					score: user.score
				});
			} else {
				res.status(404).json({ error: 'User not found' });
			}
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch user', details: err.message });
		}
	});

	// Update user role (admin)
	app.put('/api/user/:id/role', authenticateToken, isAdmin, async (req, res) => {
		const { role } = req.body;
		try {
			const result = await usersCollection.updateOne(
				{ _id: new ObjectId(req.params.id) },
				{ $set: { role, isAdmin: role === 'admin' } }
			);
			if (result.matchedCount === 0) {
				return res.status(404).json({ error: 'User not found' });
			}
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update role', details: err.message });
		}
	});

	// Delete user (admin)
	app.delete('/api/user/:id', authenticateToken, isAdmin, async (req, res) => {
		try {
			const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
			if (result.deletedCount === 0) {
				return res.status(404).json({ error: 'User not found' });
			}
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to delete user', details: err.message });
		}
	});


	// Endpoint to get user selection status
	app.get('/api/user-status', authenticateToken, async (req, res) => {
		const { email } = req.query;
		if (!email) return res.status(400).json({ error: 'Missing email' });
		try {
			const user = await usersCollection.findOne({ email });
			if (!user) return res.status(404).json({ error: 'User not found' });
			// selection can be 'selected', 'rejected', or undefined/null
			res.json({ selection: user.selection });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch user status', details: err.message });
		}
	});


	// Endpoint for admin to select/reject candidate for next round
	app.post('/api/admin/select', authenticateToken, isAdmin, async (req, res) => {
		const { email, selection } = req.body;
		if (!email || !['selected', 'rejected', null, undefined].includes(selection)) {
			return res.status(400).json({ error: 'Missing or invalid email/selection' });
		}
		try {
			const result = await usersCollection.updateOne(
				{ email },
				{ $set: { selection } }
			);
			if (result.matchedCount === 0) {
				return res.status(404).json({ error: 'User not found' });
			}
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update selection', details: err.message });
		}
	});

	// Retake test request endpoints
	app.post('/api/retake-request', authenticateToken, async (req, res) => {
		const { email, reason } = req.body;
		if (!email || !reason?.trim() || reason.length < 10) return res.status(400).json({ error: 'Valid email and reason (min 10 chars) required' });
		
		// Ensure user is requesting for themselves
		if (req.user.email !== email) return res.status(403).json({ error: 'Access denied' });
		try {
			const user = await usersCollection.findOne({ email });
			if (!user) return res.status(404).json({ error: 'User not found' });
			if (!user.testTaken) return res.status(400).json({ error: 'Test not completed yet' });
			
			const newRequest = {
				email: user.email,
				name: user.name,
				reason: reason.trim(),
				status: 'pending',
				createdAt: new Date()
			};
			await retakeRequestsCollection.insertOne(newRequest);
			res.json({ success: true, message: 'Retake request submitted successfully' });
		} catch (err) {
			console.error('Retake request error:', err);
			res.status(500).json({ error: 'Failed to submit request' });
		}
	});

	app.get('/api/admin/retake-requests', authenticateToken, isAdmin, async (req, res) => {
		try {
			const requests = await retakeRequestsCollection.find({ status: 'pending' }).sort({ createdAt: -1 }).toArray();
			res.json(requests.map(r => ({
				_id: r._id.toString(),
				email: r.email,
				name: r.name,
				reason: r.reason,
				createdAt: r.createdAt
			})));
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch retake requests' });
		}
	});

	app.post('/api/admin/retake/:id/accept', authenticateToken, isAdmin, async (req, res) => {
		try {
			const { id } = req.params;
			const request = await retakeRequestsCollection.findOne({ _id: new ObjectId(id), status: 'pending' });
			if (!request) return res.status(404).json({ error: 'Request not found or already processed' });

			// Update request status
			await retakeRequestsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'approved' } });
			
			// Enable retake for user by resetting their state
			// We clear resume, skills, score, language, and selection to ensure a fresh experience
			await usersCollection.updateOne(
				{ email: request.email },
				{ 
					$set: { canRetake: true, testTaken: false, resume: "", skills: [] },
					$unset: { score: "", language: "", selection: "" }
				}
			);

			// Also remove old record from scores collection
			await scoresCollection.deleteOne({ email: request.email });
			
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to approve retake' });
		}
	});

	app.post('/api/admin/retake/:id/reject', authenticateToken, isAdmin, async (req, res) => {
		try {
			const { id } = req.params;
			const result = await retakeRequestsCollection.updateOne(
				{ _id: new ObjectId(id), status: 'pending' },
				{ $set: { status: 'rejected' } }
			);
			if (result.matchedCount === 0) return res.status(404).json({ error: 'Request not found' });
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to reject retake' });
		}
	});

	// Mount AI router
	const aiRouter = require('./ai');
	app.use('/api', aiRouter);

	// Session Sync Endpoint
	app.get('/api/auth/me', authenticateToken, async (req, res) => {
		try {
			const user = await usersCollection.findOne({ email: req.user.email });
			if (!user) return res.status(404).json({ error: 'User not found' });
			res.json(toUserResponse(user));
		} catch (err) {
			res.status(500).json({ error: 'Failed to sync session' });
		}
	});


	// Login endpoint
	app.post('/api/login', async (req, res) => {
		let { email, password } = req.body;
		if (email) email = email.toLowerCase().trim();
		if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
		try {
			const user = await usersCollection.findOne({ email });
			if (!user) return res.status(401).json({ error: 'Account not found. Please sign up.' });
			
			// Compare hashed password
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(401).json({ error: 'Invalid password' });
			}
			
			// Issue JWT
			const token = jwt.sign(
				{ id: user._id, email: user.email, role: user.role, isAdmin: user.isAdmin },
				JWT_SECRET,
				{ expiresIn: '24h' }
			);

			res.json({ user: toUserResponse(user), token });
		} catch (err) {
			console.error('Login error:', err);
			res.status(500).json({ error: 'Login failed' });
		}
	});

	// Signup endpoint
	app.post('/api/signup', async (req, res) => {
		let { name, email, password, requestAdmin } = req.body;
		if (email) email = email.toLowerCase().trim();
		if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
		try {
			const existing = await usersCollection.findOne({ email });
			if (existing) return res.status(400).json({ error: 'User already exists' });
			
			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser = {
				name,
				email,
				password: hashedPassword,
				role: requestAdmin ? 'pending_admin' : 'user',
				isAdmin: false,
				createdAt: new Date()
			};
			const result = await usersCollection.insertOne(newUser);
			
			// Issue JWT
			const token = jwt.sign(
				{ id: result.insertedId, email: newUser.email, role: newUser.role, isAdmin: false },
				JWT_SECRET,
				{ expiresIn: '24h' }
			);

			res.json({ user: toUserResponse({ ...newUser, _id: result.insertedId }), token });
		} catch (err) {
			console.error('Signup error:', err);
			res.status(500).json({ error: 'Signup failed' });
		}
	});

	// Get pending admin requests
	app.get('/api/admin/requests', authenticateToken, isAdmin, async (req, res) => {
		try {
			const requests = await usersCollection.find({ role: 'pending_admin' }).toArray();
			res.json(requests);
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch admin requests' });
		}
	});

	// Approve or reject admin request
	app.post('/api/admin/approve', authenticateToken, isAdmin, async (req, res) => {
		const { email, approve } = req.body;
		try {
			const result = await usersCollection.updateOne(
				{ email, role: 'pending_admin' },
				{ $set: { role: approve ? 'admin' : 'user', isAdmin: approve } }
			);
			if (result.matchedCount === 0) return res.status(404).json({ error: 'Request not found' });
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to process admin request' });
		}
	});

	// Consolidated User Management endpoint
	app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
		try {
			const users = await usersCollection.find({}).toArray();
			res.json(users.map(toUserResponse));
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch users' });
		}
	});

	// Alias for backward compatibility if needed
	app.get('/api/admin/users', (req, res) => res.redirect(301, '/api/users'));


	// Google OAuth endpoint with user DB integration
	app.post('/api/google-auth', async (req, res) => {
		const { credential, mode } = req.body;
		if (!credential) return res.status(400).json({ error: 'Missing credential' });
		try {
			// Verify the Google ID token
			const ticket = await googleClient.verifyIdToken({
				idToken: credential,
				audience: GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			// Find or create user in DB
			let user = await usersCollection.findOne({ email: payload.email });
			if (!user) {
				user = {
					email: payload.email,
					name: payload.name,
					picture: payload.picture,
					role: 'user',
					isAdmin: false,
					createdAt: new Date(),
				};
				await usersCollection.insertOne(user);
			}
			// Optionally update user info on login
			await usersCollection.updateOne(
				{ email: payload.email },
				{ $set: { name: payload.name, picture: payload.picture, lastLogin: new Date() } }
			);
			const updatedUser = await usersCollection.findOne({ email: payload.email });
			
			// Issue JWT
			const token = jwt.sign(
				{ id: updatedUser._id, email: updatedUser.email, role: updatedUser.role, isAdmin: updatedUser.isAdmin },
				JWT_SECRET,
				{ expiresIn: '24h' }
			);

			res.json({ success: true, user: toUserResponse(updatedUser), token });
		} catch (err) {
			res.status(401).json({ error: 'Invalid Google credential', details: err.message });
		}
	});

	// Serve static assets from frontend/dist
	app.use(express.static(path.join(__dirname, '../frontend/dist')));

	// Catch-all route to serve index.html for React Router (Single Page Application)
	app.get('*', (req, res) => {
		res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
		res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
	});

	// Start server (single instance)
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});

	// Graceful shutdown
	process.on('SIGTERM', async () => {
		console.log('SIGTERM received. Closing MongoDB connection...');
		await mongoClient.close();
		process.exit(0);
	});

