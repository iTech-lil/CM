import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MongoDB URI in environment variables!");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("CommercailDB");
    const collection = db.collection("proformaClient");

    // Find the latest proforma (sorted by counter inside `client` object)
    const latestProforma = await collection.findOne({}, { sort: { "counter": -1 } });
    // Extract the last counter correctly from `client.counter`
    const lastCounter = latestProforma?.counter || 0;
    console.log("lastcounterfromdb",lastCounter)

    res.status(200).json({ counter: lastCounter  }); // Send the next counter
  } catch (error) {
    console.error("Error fetching last counter:", error);
    res.status(500).json({ error: "Failed to fetch last counter" });
  } finally {
    await client.close();
  }
}
