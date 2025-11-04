const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer(); // no disk storage, keeps files in memory

// Environment variables
const CLIENT_SECRET = process.env.CLIENT_SECRET; // for your server auth
const GHL_API_KEY = process.env.GHL_API_KEY;     // your GHL API key

if (!CLIENT_SECRET || !GHL_API_KEY) {
  console.error("CLIENT_SECRET or GHL_API_KEY not set in environment!");
  process.exit(1);
}

// Basic route to check server
app.get('/', (req, res) => {
  res.send('Voice upload server is running.');
});

// Endpoint to receive voice files
app.post('/voice', upload.single('voiceFile'), async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${CLIENT_SECRET}`) {
      return res.status(401).send("Unauthorized");
    }

    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).send("Missing contactId");
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).send("No file uploaded");
    }

    // Prepare form data for GHL
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('note', 'Voice recording uploaded via VAPI');
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Send file to GHL
    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/${contactId}/notes`;

    await axios.post(ghlUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${GHL_API_KEY}`
      }
    });

    res.send(`File uploaded successfully for contact ${contactId}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error uploading file');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
