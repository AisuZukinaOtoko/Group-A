const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./serviceAccount.js');

// console.log('Service account object:', serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());


// API route to fetch data from Firestore
app.get('/getSchedule', async (req, res) => {
  try {
    const snapshot = await db.collection('Transportation Schedules').get();

    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// API route to fetch data from Firestore about rent
app.get('/getRent', async (req, res) => {
  try {
    const snapshot = await db.collection('Rental Station Inventory').get();

    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// API route to fetch data from Firestore about main locations
app.get('/getLocations', async (req, res) => {
  try {
    const snapshot = await db.collection('Main Locations').get();

    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Rent
app.post('/rent', async (req, res) => {
  const { rentalId, userId, item, location } = req.body; // Get userId and location from the request body

  try {

    const decrement = admin.firestore.FieldValue.increment(-1);

    // Reference to the rental document
    const rentalRef = db.collection('Rental Station Inventory').doc(rentalId);
    const rentalDoc = await rentalRef.get();

    if (!rentalDoc.exists) {
      return res.status(404).json({ message: 'Rental item not found' });
    }

    const rentalData = rentalDoc.data();

    // Check availability
    if (rentalData.availability <= 0) {
      return res.status(400).json({ message: 'Item not available for rent' });
    }

    // Decrease availability
    rentalRef.update({
      availability: decrement
    });

    // Reference to the user document
    const userRef = db.collection('Users').doc(userId);
    
    // Fetch the user document
    const userDoc = await userRef.get();

    // Check if the user document exists
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the document by adding a new field
    await userRef.update({
      item: item,
      location: location // Add or update the location field
    });

    return res.status(200).json({ message: 'Location added successfully' });
  } catch (error) {
    console.error('Error updating document: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
