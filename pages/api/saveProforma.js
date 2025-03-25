import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  

  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    const db = client.db("CommercailDB"); //
    const collection = db.collection("proformaClient");

    const proformaData = req.body;

    const result = await collection.insertOne(proformaData);
    
    client.close();

    res.status(201).json({ message: "Proforma saved successfully", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Failed to save proforma", error: error.message });
  }
}
