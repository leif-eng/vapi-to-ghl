const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const GHL_API_KEY = "YOUR_GHL_API_KEY"; // <-- put your GHL API key here

app.post("/webhook", async (req, res) => {
  try {
    const { callerNumber, recordingUrl, transcript } = req.body;

    // Find GHL contact by phone
    const searchRes = await fetch(
      `https://api.gohighlevel.com/v1/contacts/?phone=${encodeURIComponent(
        callerNumber
      )}`,
      { headers: { Authorization: `Bearer ${GHL_API_KEY}` } }
    );
    const searchData = await searchRes.json();

    if (!searchData.contacts || searchData.contacts.length === 0) {
      return res.status(404).send("Contact not found in GHL");
    }

    const contactId = searchData.contacts[0].id;

    // Add note with transcript + recording link
    await fetch(
      `https://api.gohighlevel.com/v1/contacts/${contactId}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GHL_API_KEY}`,
        },
        body: JSON.stringify({
          note: `New call from ${callerNumber}\n\nTranscript: ${transcript}\nRecording: ${recordingUrl}`,
        }),
      }
    );

    res.status(200).send("Note added to GHL contact");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
