const { MongoClient } = require('mongodb');
const mongoUri = 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';
const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const usersCollection = db.collection('users');
    
    const adminEmail = 'admin@jobscreen.pro';
    const adminPassword = 'password123';
    
    const existing = await usersCollection.findOne({ email: adminEmail });
    if (existing) {
      await usersCollection.updateOne({ email: adminEmail }, { $set: { role: 'admin', password: adminPassword } });
      console.log('Updated existing admin user.');
    } else {
      await usersCollection.insertOne({
        name: 'Default Admin',
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        role: 'admin',
        createdAt: new Date()
      });
      console.log('Created new default admin user.');
    }
  } finally {
    await client.close();
  }
}
run();
