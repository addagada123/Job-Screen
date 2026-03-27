const { MongoClient } = require('mongodb');
const mongoUri = 'mongodb+srv://Bhanuteja:Addagada%40123@cluster0.xdcsxyh.mongodb.net/?appName=Cluster0';
const client = new MongoClient(mongoUri);

async function run() {
  try {
    await client.connect();
    const db = client.db('jobscreen');
    const coll = db.collection('scores');
    
    // Normalize emails and delete duplicates
    const allScores = await coll.find({}).toArray();
    console.log('Total scores before cleanup:', allScores.length);
    
    const seen = new Set();
    for (const s of allScores) {
      const email = s.email.toLowerCase().trim();
      if (seen.has(email)) {
        await coll.deleteOne({ _id: s._id });
        console.log('Deleted duplicate email:', email);
      } else {
        await coll.updateOne({ _id: s._id }, { $set: { email: email } });
        seen.add(email);
      }
    }
    
    // Create unique index
    try {
      await coll.dropIndex('email_1').catch(() => {});
      await coll.createIndex({ email: 1 }, { unique: true });
      console.log('Unique index on email successfully created.');
    } catch (e) {
      console.error('Error creating unique index:', e.message);
    }
    
    const finalScores = await coll.find({}).toArray();
    console.log('Total scores after cleanup:', finalScores.length);
    
  } finally {
    await client.close();
  }
}

run();
