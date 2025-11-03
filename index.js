const express = require("express");
const app = express();
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

app.post("/webhook", (req, res) => {
  console.log("Webhook hit:", req.body);
  res.status(200).send("Received webhook");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
