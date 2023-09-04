const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://geerthikumar:f3rk02JZjpHfJ3z4@cluster0.3o1mx9f.mongodb.net'; // Replace with your MongoDB connection URL
const dbName = 'runo'; // Replace with your database name

const startDate = new Date('2023-06-01');
const endDate = new Date('2023-06-30');

const sampleVaccineCounts = Array(14).fill(10); // Default value for each slot

async function insertSampleData() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('slot_details');

    // Loop through the dates from startDate to endDate
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const record = {
        "slotDate": new Date(currentDate),
        "vaccinesAvailable": 140, // Constant value
        "slotVaccines": [...sampleVaccineCounts] // Copy the default array
      };

      // Insert the record into the collection
      await collection.insertOne(record);
    }

    console.log('Sample data inserted successfully.');
  } catch (err) {
    console.error('Error inserting sample data:', err);
  } finally {
    client.close();
  }
}

insertSampleData();
