const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Error: MONGODB_URI not found in .env');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const usersCollection = db.collection('users');
    
    const adminEmail = 'admin@jobscreen.pro';
    const adminPassword = 'password123';
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const existing = await usersCollection.findOne({ email: adminEmail });
    if (existing) {
      await usersCollection.updateOne(
        { email: adminEmail }, 
        { $set: { role: 'admin', isAdmin: true, password: hashedPassword } }
      );
      console.log('Updated existing admin user with hashed password.');
    } else {
      await usersCollection.insertOne({
        name: 'Default Admin',
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date()
      });
      console.log('Created new default admin user.');
    }
  } finally {
    await client.close();
  }
}
run();
