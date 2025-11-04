const axios = require("axios");

// 🔑 Replace with your sub-account API key
const GHL_API_KEY = "sk_YOUR_SUB_ACCOUNT_KEY_HERE";

// Replace with a phone number you want to test
const testPhone = "+15551234567";
const testFirstName = "Test";
const testLastName = "User";

async function checkOrCreateContact() {
  try {
    // 1️⃣ Try to find the contact by phone number
    const searchRes = await axios.get(
      `https://rest.gohighlevel.com/v1/contacts/lookup?phone=${encodeURIComponent(testPhone)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contact = searchRes.data.contact;

    if (contact) {
      console.log(`✅ Contact exists: ${contact.id} (${contact.firstName} ${contact.lastName})`);
    } else {
      console.log("❌ Contact not found, creating...");

      // 2️⃣ Create a new contact
      const createRes = await axios.post(
        "https://rest.gohighlevel.com/v1/contacts/",
        {
          firstName: testFirstName,
          lastName: testLastName,
          phone: testPhone
        },
        {
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ New contact created:", createRes.data.contact.id);
    }
  } catch (error) {
    console.error("❌ API key invalid or request failed:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

checkOrCreateContact();
