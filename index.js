const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 Your GHL API key
const GHL_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InJiMVMxZlBpQ3ZGd1JzWEE0Qm9hIiwidmVyc2lvbiI6MSwiaWF0IjoxNzYyMTc3OTI4ODEwLCJzdWIiOiIzSWNobFF4NHNoZVoyWmVoYk4xTiJ9.01Gj0QGRIMW8HstPqOSd5iRZfT3CfvP7Lqp-ut8tKPI";

// Webhook endpoint for VAPI
app.post("/webhook", async (req, res) => {
  console.log("Webhook /webhook triggered");
  console.log("Incoming request:", req.body);

  const { callerNumber, recordingUrl, transcript } = req.body;

  if (!callerNumber) {
    console.log("No callerNumber provided in request");
    return res.status(400).send("Missing callerNumber");
  }

  try {
    // 1️⃣ Lookup contact by phone
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

    // 2️⃣ Create contact if not found
    if (!contact) {
      console.log("No contact found. Creating a new one...");
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

    // 3️⃣ Add note with transcript and recording
    const noteText = `📞 Call Transcript:\n${transcript || "No transcript"}\n\n🎧 Recording: ${recordingUrl || "No recording URL"}`;

    await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/${contact.id}/notes/`,
      { body: noteText },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "applica
