// Run this script with: node createAdmin.js
// It will create or update an admin user in your MongoDB for JobScreen

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const users = db.collection('users');
    await users.updateOne(
      { email: 'admin@123' },
      {
        $set: {
          name: 'Admin',
          email: 'admin@123',
          password: 'pass-admin',
          role: 'admin',
          isAdmin: true,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Admin user created/updated successfully.');
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await client.close();
  }
})();
