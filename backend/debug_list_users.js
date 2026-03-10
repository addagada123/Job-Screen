const { MongoClient } = require('mongodb');
const mongoUri = 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';
const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const users = await db.collection('users').find({}).toArray();
    console.log(JSON.stringify(users.map(u => ({ email: u.email, role: u.role })), null, 2));
  } finally {
    await client.close();
  }
}
run();
