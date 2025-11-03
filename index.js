app.post("/webhook", async (req, res) => {
  console.log("Webhook /webhook triggered");
  console.log("Body:", req.body);

  const { callerNumber, recordingUrl, transcript } = req.body;

  if (!callerNumber) {
    console.log("No callerNumber in request");
    return res.status(400).send("Missing callerNumber");
  }

  try {
    // Step 1: Find the GHL contact by phone number
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

    // ✅ If no contact exists, create a new one
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

    // Step 2: Add a note to the contact
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
