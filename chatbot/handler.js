const { sendWelcomeTemplate } = require("./whatsapp_processor");

const verifyToken = (req) => {
  return req.query["hub.verify_token"] === "helloworld";
};

const handler = async (req, res) => {
  const httpMethod = req.method;
  const messageData = req.body;

  if (httpMethod == "GET") {
    if (verifyToken(req)) {
      res.send(req.query["hub.challenge"]);
    } else {
      res.send("Forbidden");
    }
  } else {
    const whatsAppPayload = messageData.entry[0].changes[0].value;

    if (!!whatsAppPayload.contacts) {
      const whatsAppId = whatsAppPayload.contacts[0].wa_id;
      const typeOfMessage = whatsAppPayload.messages[0].type;

      if (typeOfMessage === "text") {
        const messageBody = whatsAppPayload.messages[0].text.body;
        await sendWelcomeTemplate(whatsAppId);
        res.send("ok");
      }
    }
  }
};

module.exports = {
  handler: handler,
};
