const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const mongoUri = "mongodb+srv://geerthikumar:f3rk02JZjpHfJ3z4@cluster0.3o1mx9f.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

app.post('/api/register', async (req, res) => {
  const userRegData = req.body;
  const { name, phoneNumber, age, pincode, aadharNo, password } = userRegData;
  const user = {
    name,
    phoneNumber,
    age,
    pincode,
    aadharNo,
    password,
  };

  if (name && phoneNumber && age && pincode && aadharNo && password) {
    try {
      const client = await mongoClient.connect();
      const collection = client.db('runo').collection('user_data');

      const existingUser = await collection.findOne({ phoneNumber: phoneNumber });

      if (!existingUser) {
        // Phone number is not registered, insert the new user data
        await collection.insertOne(user);
        res.status(200).json({ message: "User registered successfully" });
      } else {
        // Phone number already exists, send a response indicating that the user should sign in
        res.status(200).json({ message: "Phone number already exists. Please sign in!" });
      }
    } catch (error) { 
console.log(error);
      // Handle any potential errors
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the MongoDB client connection
      mongoClient.close();
    }
  } else {
    // Invalid request data, send a response indicating invalid data
    res.status(400).json({ message: "Invalid request data" });
  }
});

app.post('/api/login', async (req, res) => {
  const userLogData = req.body;
  const { phoneNumber, password } = userLogData;

  if (phoneNumber && password) {
    try {
      const client = await mongoClient.connect();
      const collection = client.db('runo').collection('user_data');

      const userData = await collection.findOne({ phoneNumber: phoneNumber });

      if (userData === null) {
        // User not found, send a response indicating the phone number does not exist
        res.status(200).json({ message: "Phone number does not exist. Please register!" });
      } else {
        if (userData.password !== password) {
          // Password is incorrect, send a response indicating the incorrect password
          res.status(200).json({ message: "Password is incorrect!" });
        } else {
          // Login successful, send a response indicating successful login
          res.status(200).json({ message: "Login successfully!" });
        }
      }
    } catch (error) { 
console.log(error);
      // Handle any potential errors
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the MongoDB client connection
      mongoClient.close();
    }
  } else {
    // Invalid request data, send a response indicating invalid data
    res.status(400).json({ message: "Invalid request data" });
  }
});

app.get('/slots/:date', async (req, res) => {
  const date = req.params.date;

  try {
    const client = await mongoClient.connect();
    const collection = await client.db('runo').collection('slot_details');
    const availableSlots = await collection.findOne({ slotDate: new Date(date) });
    const availabilityData = [];
    console.log(availableSlots);
    if (availableSlots.vaccinesAvailable > 0) {
      for (let i = 0; i < availableSlots.slotVaccines.length; i++) {
        const slot = {
          slot: `${10 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`, // Generate time for the slot
          count: availableSlots.slotVaccines[i], // Number of vaccines available for the slot
        };
        availabilityData.push(slot);
      }
      res.status(200).json({ availableSlots: availabilityData });
    } else {
      res.status(200).json({ message: "Slots not available at this moment!" });
    }
  } catch (error) { 
console.log(error);
    // Handle any potential errors
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the MongoDB client connection
    mongoClient.close();
  }
});
app.post('/slot/register', async (req, res) => {
    try {
      const regSlot = req.body;
      const { phoneNumber, slotDate, slotTime, vaccineStatus } = regSlot;
  
      if (phoneNumber && slotDate && slotTime && vaccineStatus) {
        const client = await mongoClient.connect();
        const slotCollection = client.db('runo').collection('slot_reg_details');
        const detailsCollection = client.db('runo').collection('slot_details');
  
        const existsRecord = await slotCollection.findOne({ phoneNumber: phoneNumber });
  
        if ((vaccineStatus === 1 && !existsRecord) || (vaccineStatus === 2 && existsRecord)) {
          // Convert slotDate to JavaScript Date object
          const currentDate = new Date(slotDate);
          // Calculate slot index based on slotTime
          const slotIndex = calculateSlotIndex(slotTime);
          // Update slot details
          await detailsCollection.updateOne(
            { slotDate: currentDate },
            {
              $inc: {
                [`slotVaccines.${slotIndex}`]: -1, // Decrease slotVaccines count by 1
                vaccinesAvailable: -1, // Decrease vaccinesAvailable count by 1
              },
            }
          );
  
          regSlot.slotDate = currentDate;
  
          await slotCollection.insertOne(regSlot);
          
          res.status(200).json({ message: "Slot registered successfully" });
        } else {
          res.status(400).json({ message: "Can't register a slot" });
        }
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    } catch (error) {
      // Handle any potential errors
      console.error("Error in /slot/register:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the MongoDB client connection
    mongoClient.close();
    }
  });
  
  // Function to calculate slot index based on slotTime
// Function to calculate slot index based on slotTime
function calculateSlotIndex(slotTime) {
    const [hour, minute] = slotTime.split(':').map(Number);
    console.log(hour, minute);
    return (hour - 10) * 2 + (minute === 0 ? 0 : 1);
}

app.patch('/slot/update', async (req, res) => {
    try {
        const updSlot = req.body;
        const { phoneNumber, newSlotDate, newSlotTime, vaccineStatus } = updSlot;

        if (phoneNumber && newSlotDate && newSlotTime && vaccineStatus) {
            const client = await mongoClient.connect();
            const slotCollection = client.db('runo').collection('slot_reg_details');
            const detailsCollection = client.db('runo').collection('slot_details');

            const existsRecordCount = await slotCollection.countDocuments({
                phoneNumber: phoneNumber,
                vaccineStatus: vaccineStatus,
            });

            if ((vaccineStatus === 1 && existsRecordCount === 1) || (vaccineStatus === 2 && existsRecordCount === 2)) {
                // Convert the JavaScript date (newSlotDate) to a MongoDB ISODate object
                const isoNewSlotDate = new Date(newSlotDate);

                // Calculate the slot index based on the newSlotTime
                const newSlotIndex = calculateSlotIndex(newSlotTime);
                console.log('new: ' + newSlotIndex);

                // Find the existing slot for the provided phoneNumber and vaccineStatus
                const existingSlot = await slotCollection.findOne({
                    phoneNumber: phoneNumber,
                    vaccineStatus: vaccineStatus,
                });

                if (existingSlot) {
                    // Calculate the slot index for the existing slotTime
                    const existingSlotIndex = calculateSlotIndex(existingSlot.slotTime);
                    console.log('exist: ' + existingSlotIndex);

                    // Update slot details for the previous slotDate and slotTime
                    await detailsCollection.updateOne(
                        { slotDate: existingSlot.slotDate },
                        {
                            $inc: {
                                [`slotVaccines.${existingSlotIndex}`]: 1,
                                vaccinesAvailable: 1, // Increase the count for the previous slot
                            },
                        }
                    );
                  

                    // Update slot details for the new slotDate and slotTime
                    await detailsCollection.updateOne(
                        { slotDate: isoNewSlotDate },
                        {
                            $inc: {
                                [`slotVaccines.${newSlotIndex}`]: -1,
                                vaccinesAvailable: -1, // Decrease the count for the new slot
                            },
                        }
                    );

                    // Update the document(s) matching the conditions in the slot_reg_details collection
                    const upt = await slotCollection.updateMany(
                        {
                            $and: [
                                { phoneNumber: phoneNumber },
                                { vaccineStatus: vaccineStatus },
                                // Add more conditions as needed
                            ],
                        },
                        { $set: { slotDate: isoNewSlotDate, slotTime: newSlotTime } }
                    );

                    console.log('Updating slot 3:');
                    console.log(upt);

                    res.status(200).json({ message: "Slot updated successfully" });
                } else {
                    res.status(400).json({ message: "Slot not found for the provided data" });
                }
            } else {
                res.status(400).json({ message: "Can't update the slot" });
            }
        } else {
            res.status(400).json({ message: "Invalid request data" });
        }
    } catch (error) {
        // Handle any potential errors
        console.error("Error in /slot/update:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        // Close the MongoDB client connection
        mongoClient.close();    }
});

  
  // Function to calculate slot index based on slotTim
  
app.post('/api/admin/login', async (req, res) => {
  const adminCredentials = req.body;
  const { username, password } = adminCredentials;

  if (username && password) {
    try {
      const client = await mongoClient.connect();
      const collection = client.db('runo').collection('admin_data');

      const adminData = await collection.findOne({ username: username });

      if (adminData && adminData.password === password) {
        // Admin login successful
        res.status(200).json({ message: "Admin login successfully" });
      } else {
        // Invalid admin credentials
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) { 
console.log(error);
      // Handle any potential errors
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the MongoDB client connection
      mongoClient.close();
    }
  } else {
    // Invalid request data
    res.status(400).json({ message: "Invalid request data" });
  }
});

app.get('/admin/registered-slots', async (req, res) => {
  const { age, pincode, vaccinationStatus } = req.query;

  try {
    const client = await mongoClient.connect();
    const db = client.db('runo');
    const collection = db.collection('slot_reg_details');

    const pipeline = [];

    // Match documents based on query parameters
    const matchStage = {};

    if (age) {
      matchStage['user_data.age'] = parseInt(age);
    }

    if (pincode) {
      matchStage['user_data.pincode'] = pincode;
    }

    if (vaccinationStatus) {
      matchStage['user_data.vaccinationStatus'] = vaccinationStatus;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Join the collections
    pipeline.push({
      $lookup: {
        from: 'user_data',
        localField: 'phoneNumber',
        foreignField: 'phoneNumber',
        as: 'user_data',
      },
    });

    // Execute the aggregation
    const result = await collection.aggregate(pipeline).toArray();

    res.status(200).json({ joinedData: result });
  } catch (error) { 
console.log(error);
    // Handle any potential errors
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the MongoDB client connection
    mongoClient.close();
  }
});

app.get('/admin/slots/:date', async (req, res) => {
  const date = req.params.date;

  try {
    const client = await mongoClient.connect();
    const db = client.db('runo');
    const collection = db.collection('slot_reg_details');

    // Find documents matching the specified date
    const slotData = await collection.find({ slotDate: new Date(date) }).toArray();

    if (slotData.length > 0) {
      // Calculate the counts for first dose, second dose, and total
      let firstDoseCount = 0;
      let secondDoseCount = 0;
      let totalCount = 0;

      slotData.forEach((record) => {
        firstDoseCount += record.firstDose || 0;
        secondDoseCount += record.secondDose || 0;
        totalCount += (record.firstDose || 0) + (record.secondDose || 0);
      });

      res.status(200).json({
        firstDose: firstDoseCount,
        secondDose: secondDoseCount,
        total: totalCount,
      });
    } else {
      res.status(404).json({ message: "No slot data found for the specified date" });
    }
  } catch (error) { 
console.log(error);
    // Handle any potential errors
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the MongoDB client connection
    mongoClient.close();
  }
});

app.listen(8884, function () {
  console.log('Server started');
});
