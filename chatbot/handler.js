const {
  sendWelcomeTemplate,
  sendMessageByTemplateId,
  sendWelcomeTemplateNonExistingNumber,
  sendDyamicMessage,
  sendTheResidenceGuide,
} = require("./whatsapp_processor");
const moment = require("moment");

const verifyToken = (req) => {
  return req.query["hub.verify_token"] === "helloworld";
};

let users = [
  {
    emailAddress: "fezekileplaatyi@gmail.com",
    cellNumber: "+27780687445",
    whatsAppNumber: "+27780687445",
    name: "Fezekile",
    surname: "Plaatyi",
    roomNumber: "3409",
    activeSessionDetails: {
      currentStatus: 0,
    },
  },
];

const generateAccessCode = async () => {
  return Math.floor(Math.random() * 90000) + 10000;
};

const updateStatus = async (whatsAppId, status) => {
  const formattedCellNumber = `+${whatsAppId.replace(/\D/g, "")}`;

  users.forEach((user) => {
    if (
      user.whatsAppNumber === formattedCellNumber ||
      user.cellNumber === formattedCellNumber
    ) {
      user.activeSessionDetails.currentStatus = status;
    }
  });
  return users;
};

const checkUserExistence = (cellNumber) => {
  const formattedCellNumber = `+${cellNumber.replace(/\D/g, "")}`;

  const foundUser = users.find(
    (user) =>
      user.cellNumber === formattedCellNumber ||
      user.whatsAppNumber === formattedCellNumber
  );

  const result = {
    exist: foundUser !== undefined,
    details: foundUser || null,
  };

  return result;
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
    console.log(JSON.stringify(whatsAppPayload));

    if (!!whatsAppPayload.contacts) {
      const whatsAppId = whatsAppPayload.contacts[0].wa_id;
      const typeOfMessage = whatsAppPayload.messages[0].type;
      const result = checkUserExistence(whatsAppId);

      if (typeOfMessage === "text") {
        const messageBody = whatsAppPayload.messages[0].text.body;

        if (result.exist) {
          if (result.details.activeSessionDetails.currentStatus == 0) {
            await sendWelcomeTemplate(whatsAppId);
            users = await updateStatus(whatsAppId, 1);
            res.send("ok");
          } else if (result.details.activeSessionDetails.currentStatus == 1) {
            if (messageBody.trim() == "1") {
              await sendMessageByTemplateId(
                whatsAppId,
                "the_apollo_access_code_main_menu_temp"
              );
              users = await updateStatus(whatsAppId, 2);
              res.send("ok");
            } else if (messageBody.trim() == "4") {
              users = await updateStatus(whatsAppId, 0);
              await sendTheResidenceGuide(whatsAppId);
              res.send("ok");
            } else if (messageBody.trim() == "7") {
              await sendMessageByTemplateId(
                whatsAppId,
                "the_appolo_feedback_temp"
              );
              users = await updateStatus(whatsAppId, 3);
              res.send("ok");
            } else {
              await sendMessageByTemplateId(
                whatsAppId,
                "the_appolo_work_in_progress_temp"
              );
              users = await updateStatus(whatsAppId, 0);
              res.send("ok");
            }
          } else if (result.details.activeSessionDetails.currentStatus == 3) {
            await sendMessageByTemplateId(
              whatsAppId,
              "the_appolo_feedback_appreciation_temp"
            );
            users = await updateStatus(whatsAppId, 0);
            res.send("ok");
          }
        } else {
          await sendWelcomeTemplateNonExistingNumber(whatsAppId);
          res.send("ok");
        }
      } else if (typeOfMessage === "button") {
        if (result.exist) {
          if (result.details.activeSessionDetails.currentStatus == 0) {
            users = await updateStatus(whatsAppId, 0);
            await sendMessageByTemplateId(
              whatsAppId,
              "the_apollo_invalid_input_temp"
            );
            await sendWelcomeTemplate(whatsAppId);
            res.send("ok");
          } else if (result.details.activeSessionDetails.currentStatus == 2) {
            users = await updateStatus(whatsAppId, 0);

            const today = moment().endOf("day");
            const expiryDateTime = today.format("YYYY-MM-DD HH:mm:ss");
            const accessCode = await generateAccessCode();
            const use =
              whatsAppPayload.messages[0].button.payload == "Tap2 - 2x Entry"
                ? "2"
                : "1";

            const messageBody = `*🔐The Apollo Tap Access Code*\n\nThe access code for your visitor is *${accessCode}*.\n\nThis code is valid for *${use} use${
              use > 1 ? "s" : ""
            }* until *${expiryDateTime}*.\n \n *Instructions:*\n Please provide this code to the security personnel at the gate for your visitor's access. The code allows two entries.\n \n If your visitor encounters any issues or if you have questions, please let us know. Thank you! `;

            await sendDyamicMessage(whatsAppId, messageBody);
            res.send("ok");
          }
        }
      }
    }
  }
};

module.exports = {
  handler: handler,
};
