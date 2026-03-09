(function () {
	const express = require('express');
	const cors = require('cors');
	const dotenv = require('dotenv');
	const { OAuth2Client } = require('google-auth-library');
	const { MongoClient, ObjectId } = require('mongodb');
	dotenv.config();

	const app = express();
	const allowedOrigins = [
		'http://localhost:5173', // or your local dev port
		'https://job-screen-ibojdhxsb-addagada123s-projects.vercel.app'
	];
	app.use(cors({
		origin: allowedOrigins,
		credentials: true
	}));
	app.use(express.json());

	// Google OAuth2 client
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

	// MongoDB setup
	const mongoUri = process.env.MONGODB_URI;
	const mongoClient = new MongoClient(mongoUri);
	let usersCollection;

	async function connectDb() {
		await mongoClient.connect();
		const db = mongoClient.db();
		usersCollection = db.collection('users');
		console.log('Connected to MongoDB');
	}
	connectDb().catch(console.error);

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
				};
				await usersCollection.insertOne(user);
			}

			// Return user info (simulate session)
			res.json({
				success: true,
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
					firstName: user.firstName,
					picture: user.picture,
					role: user.role,
					score: user.score,
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
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update score', details: err.message });
		}
	});

	// Start server
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
})();
