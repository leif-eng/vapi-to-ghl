const express = require("express");
const fetch = require("node-fetch"); // used for sending data to GHL
const app = express();

app.use(express.json()); // parse JSON bodies

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body);

  // Example: send to GHL contact (replace with your API details)
  const ghlApiUrl = "https://your-ghl-instance.com/v1/contacts/notes";
  const ghlApiKey = "YOUR_GHL_API_KEY";

  if (req.body.callerNumber && req.body.transcript) {
    try {
      const notePayload = {
        contact: {
          phone: req.body.callerNumber
        },
        note: `Transcript: ${req.body.transcript}\nRecording: ${req.body.recordingUrl || "No recording URL"}`
      };

      const response = await fetch(ghlApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ghlApiKey}`
        },
        body: JSON.stringify(notePayload)
      });

      if (response.ok) {
        console.log("Note successfully sent to GHL");
      } else {
        console.error("Failed to send note to GHL:", await response.text());
      }
    } catch (err) {
      console.error("Error sending to GHL:", err);
    }
  } else {
    console.log("Webhook missing callerNumber or transcript");
  }

  res.status(200).send("Webhook received");
});

// Listen on Render-assigned port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
