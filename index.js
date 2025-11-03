const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 Replace this with your GHL API key
const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InJiMVMxZlBpQ3ZGd1JzWEE0Qm9hIiwidmVyc2lvbiI6MSwiaWF0IjoxNzYyMTc0MjQ4MjY0LCJzdWIiOiIzSWNobFF4NHNoZVoyWmVoYk4xTiJ9.DMJWuIXQcoKIwYTAya_ACEwTLafUFCTaSoiO71mjNnM";

// Webhook endpoint for VAPI
app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body);

  const { callerNumber, recordingUrl, transcript } = req.body;

  try {
    // Step 1: Find the GHL contact by phone number
    const searchResponse = await axios.get(
      `https://rest.gohighlevel.com/v1/contacts/lookup?phone=${encodeURIComponent(callerNumber)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contact = searchResponse.data.contact;

    if (!contact) {
      console.log("No contact found for this phone number.");
      return res.status(200).send("No matching contact found in GHL");
    }

    // Step 2: Add a note to the contact with the transcript and recording
    const noteText = `📞 Call Transcript:\n${transcript}\n\n🎧 Recording: ${recordingUrl}`;

    await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/${contact.id}/notes/`,
      { body: noteText },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Note added to GHL contact:", contact.id);
    res.status(200).send("Transcript and recording added to contact");
  } catch (error) {
    console.error("Error adding note to GHL:", error.message);
    res.status(500).send("Error adding note to GHL");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
