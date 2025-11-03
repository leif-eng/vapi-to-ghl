const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 Replace this with your GHL API key
const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InJiMVMxZlBpQ3ZGd1JzWEE0Qm9hIiwidmVyc2lvbiI6MSwiaWF0IjoxNzYyMTc0MjQ4MjY0LCJzdWIiOiIzSWNobFF4NHNoZVoyWmVoYk4xTiJ9.DMJWuIXQcoKIwYTAya_ACEwTLafUFCTaSoiO71mjNnM";

// Webhook endpoint for VAPI
app.post("/webhook", async (req, res) => {
  console.log("Webhook /webhook triggered");
  console.log("Incoming request body:", req.body);

  const { callerNumber, recordingUrl, transcript } = req.body;

  if (!callerNumber) {
    console.log("No callerNumber provided in the request");
    return res.status(400).send("Missing callerNumber");
  }

  try {
    // Step 1: Look up the contact in GHL by phone number
    let searchResponse = await axios.get(
      `https://rest.gohighlevel.com/v1/contacts/lookup?phone=${encodeURIComponent(callerNumber)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let contact = searchResponse.data.contact;

    // Step 2: Auto-create contact if it doesn't exist
    if (!contact) {
      const createResponse = await axios.post(
        "https://rest.gohighlevel.com/v1/contacts/",
        { phone: callerNumber },
        {
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      contact = createResponse.data.contact;
      console.log("Created new contact:", contact.id);
    }

    // Step 3: Add a note to the contact
    const noteText = `📞 Call Transcript:\n${transcript || "No transcript"}\n\n🎧 Recording: ${recordingUrl || "No recording URL"}`;

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

    console.log("✅ Note added to GHL contact:", contact.id);
    res.status(200).send("Transcript and recording added to contact");
  } catch (error) {
    console.error("❌ Error adding note to GHL:", error.response?.data || error.message);
    res.status(500).send("Error adding note to GHL");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
