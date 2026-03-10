const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';
const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const users = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log('Admins found:', users.map(u => u.email));
  } finally {
    await client.close();
  }
}
run();
