require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '406943845792-eiubf40t6lth2sk5fbtbllfia9buj26c.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Default root endpoint
app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

// ...existing code...

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

	// Retake test request endpoints
	app.post('/api/retake-request', async (req, res) => {
		const { email, reason } = req.body;
		if (!email || !reason?.trim() || reason.length < 10) return res.status(400).json({ error: 'Valid email and reason (min 10 chars) required' });
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

	app.get('/api/admin/retake-requests', async (req, res) => {
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

	app.post('/api/admin/retake/:id/accept', async (req, res) => {
		try {
			const { id } = req.params;
			const request = await retakeRequestsCollection.findOne({ _id: new ObjectId(id), status: 'pending' });
			if (!request) return res.status(404).json({ error: 'Request not found or already processed' });

			// Update request status
			await retakeRequestsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'approved' } });
			
			// Enable retake for user
			await usersCollection.updateOne(
				{ email: request.email },
				{ $set: { canRetake: true, testTaken: false } }
			);
			
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: 'Failed to approve retake' });
		}
	});

	app.post('/api/admin/retake/:id/reject', async (req, res) => {
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
					createdAt: new Date(),
				};
				await usersCollection.insertOne(user);
			}
			// Optionally update user info on login
			await usersCollection.updateOne(
				{ email: payload.email },
				{ $set: { name: payload.name, picture: payload.picture, lastLogin: new Date() } }
			);
			res.json({ success: true, user });
		} catch (err) {
			res.status(401).json({ error: 'Invalid Google credential', details: err.message });
		}
	});

	// Start server (single instance)
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});

