import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(' Missing MongoDB URI in environment variables! Add MONGODB_URI in .env.local');
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("CommercailDB");
      const { fullName, phone,observation } = req.body;
      
      if (!fullName || !phone) {
        return res.status(400).json({ error: 'Full Name and Phone are required' });
      }

      await db.collection("clientDB").insertOne({ fullName, phone,observation });
      await client.close();
      res.status(201).json({ message: 'Client added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding client' });
    }
  } 
  else if (req.method === 'GET') {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("CommercailDB");
      const clients = await db.collection("clientDB").find({}).toArray();
      await client.close();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching clients' });
    }
  } 
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
