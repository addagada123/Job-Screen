(function () {
	const express = require('express');
	const cors = require('cors');
	const dotenv = require('dotenv');
	const { OAuth2Client } = require('google-auth-library');
	const { MongoClient, ObjectId } = require('mongodb');
	const multer = require('multer');
	const parseResume = require('./resumeParser');
	const extractSkills = require('./skillExtract');
	// const { openai } = require('./ai'); // Uncomment and configure for AI job matching
	const upload = multer();
	dotenv.config();

	const app = express();


	// CORS configuration - allow Vercel frontend and localhost
	const corsOptions = {
		origin: [
			'https://job-screen-frontend.onrender.com'
		],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	};
	app.use(cors(corsOptions));
	app.use(express.json());

	// Google OAuth2 client
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	// MongoDB setup
	const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';
	const mongoClient = new MongoClient(mongoUri);
	let db, usersCollection, scoresCollection;

	async function connectDb() {
		try {
			await mongoClient.connect();
			db = mongoClient.db('jobscreen');
			usersCollection = db.collection('users');
			scoresCollection = db.collection('scores');
			
			// Create indexes
			await usersCollection.createIndex({ email: 1 }, { unique: true });
			await scoresCollection.createIndex({ email: 1 });
			
			console.log('Connected to MongoDB');
		} catch (err) {
			console.error('MongoDB connection error:', err);
		}
	}
	connectDb();

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

			// Check if user exists, else create
			let user = await usersCollection.findOne({ email });
			if (!user) {
				user = {
					googleId: sub,
					email,
					name,
					firstName,
					picture,
					role: 'candidate',
					score: null,
					createdAt: new Date()
				};
				await usersCollection.insertOne(user);
				user = await usersCollection.findOne({ email });
			}

			// Return user info
			res.json({
				success: true,
				user: {
					id: user._id.toString(),
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
			const result = await usersCollection.updateOne(
				{ email },
				{ $set: { score } }
			);
			if (result.matchedCount === 0) {
				return res.status(404).json({ error: 'User not found' });
			}
			
			// Also save to scores collection
			await scoresCollection.insertOne({ email, score, date: new Date() });
			
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
			const user = await usersCollection.findOne({ email, password });
			if (!user) {
				return res.status(401).json({ error: 'Invalid credentials' });
			}
			res.json({
				id: user._id.toString(),
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
			const existingUser = await usersCollection.findOne({ email });
			if (existingUser) {
				return res.status(409).json({ error: 'User already exists' });
			}

			const newUser = {
				name,
				email,
				password,
				firstName: name.split(' ')[0],
				role: requestAdmin ? 'pending_admin' : 'candidate',
				score: null,
				createdAt: new Date()
			};

			await usersCollection.insertOne(newUser);

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
			const users = await usersCollection.find({}).toArray();
			res.json(users.map(u => ({
				id: u._id.toString(),
				email: u.email,
				name: u.name,
				role: u.role,
				score: u.score
			})));
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch users', details: err.message });
		}
	});

	// Get all scores (admin)
	app.get('/api/scores', async (req, res) => {
		try {
			const scores = await scoresCollection.find({}).toArray();
			res.json(scores);
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch scores', details: err.message });
		}
	});


	// New upload-resume endpoint (file upload)
	app.post('/upload-resume', upload.single('resume'), async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ error: 'No file uploaded' });
			}
			const text = await parseResume(req.file);
			// Skill extraction
			const skills = extractSkills(text);
			// AI job matching placeholder (uncomment and implement as needed)
			// const response = await openai.chat.completions.create({
			//   model: "gpt-4o-mini",
			//   messages: [
			//     { role: "user", content: `Extract job type and experience from this resume:\n${text}` }
			//   ]
			// });
			// const aiResult = response.choices[0].message.content;
			res.json({
				success: true,
				resumeText: text,
				skills,
				// aiResult
			});
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	});

	// Get resume
	app.get('/api/resume/:email', async (req, res) => {
		try {
			const user = await usersCollection.findOne({ email: req.params.email });
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
	app.get('/api/user/:id', async (req, res) => {
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
	app.put('/api/user/:id/role', async (req, res) => {
		const { role } = req.body;
		try {
			const result = await usersCollection.updateOne(
				{ _id: new ObjectId(req.params.id) },
				{ $set: { role } }
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
	app.delete('/api/user/:id', async (req, res) => {
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
	app.get('/api/user-status', async (req, res) => {
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
	app.post('/api/admin/select', async (req, res) => {
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

	// Mount AI router
	const aiRouter = require('./ai');
	app.use('/api', aiRouter);

	// Start server
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
})();

