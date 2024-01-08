const express = require("express");
const handler = require("./handler");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/whatsapp-handler", (req, res) => {
  handler.handler(req, res);
});

app.post("/whatsapp-handler", (req, res) => {
  handler.handler(req, res);
});

app.get("/logo", function (req, res) {
  res.sendFile(__dirname + "/logo.png");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
