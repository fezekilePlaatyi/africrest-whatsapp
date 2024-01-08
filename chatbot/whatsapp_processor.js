const axios = require("axios");
const END_POINT = "https://graph.facebook.com/v17.0/104770505677441/messages";

const headers = {
  Authorization:
    "Bearer EAAKMZAXDRZBjkBO6m2arhohOMKZBzHRKQh78VeR5dzZAjML5NQribC1E1NrnDHuRl2KyO8nQgkn1UBCFoZAohwTJfG4VrqCXEgpGx0PJXwzPkwkvn5IbfvkjrZAdUToRijmi5RcZAYciZCCZB2GgIAMYohRVQr3gVqPX9oAICxObsh85n6oHAPkRCXskuDWW43PcNzPxdOAPF6o5uBaTC3bu5qqACZCbR9K9KXJHcZD",
  "Content-Type": "application/json",
};

const sendRestApi = async (payload) => {
  return new Promise((resolve, reject) => {
    axios
      .post(END_POINT, payload, {
        headers: headers,
      })
      .then((res) => resolve("ok"))
      .catch((error) => reject(error));
  });
};

const sendMessageByTemplateId = async (whatsAppId, templateId) => {
  const payload = {
    messaging_product: "whatsapp",
    to: whatsAppId,
    type: "template",
    template: {
      name: templateId,
      language: {
        code: "en_US",
      },
    },
  };

  return sendRestApi(payload);
};

const sendAccessCodeTemplate = async (
  whatsAppId,
  accessCode,
  use,
  expiryDateTime
) => {
  const payload = {
    messaging_product: "whatsapp",
    to: whatsAppId,
    type: "template",
    template: {
      name: "the_apollo_access_code_response_temp",
      language: {
        code: "en_US",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: accessCode,
            },
            {
              type: "text",
              text: use,
            },
            {
              type: "text",
              text: expiryDateTime,
            },
          ],
        },
      ],
    },
  };

  return sendRestApi(payload);
};

const sendDyamicMessage = (whatsAppId, messageBody) => {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: whatsAppId,
    type: "text",
    text: {
      preview_url: false,
      body: messageBody,
    },
  };

  return sendRestApi(payload);
};

const sendWelcomeTemplate = async (whatsAppId) => {
  const payload = {
    messaging_product: "whatsapp",
    to: whatsAppId,
    type: "template",
    template: {
      name: "the_apollo_welcome_temp",
      language: {
        code: "en_US",
      },
      components: [
        {
          type: "Header",
          parameters: [
            {
              type: "image",
              image: {
                link: "https://theapollo.co.za/wp-content/uploads/2021/03/APOLLO_Logo_Primary_BL-scaled.jpg",
              },
            },
          ],
        },
      ],
    },
  };

  return sendRestApi(payload);
};

const sendWelcomeTemplateNonExistingNumber = async () => {
  return sendRestApi(payload);
};

module.exports = {
  sendWelcomeTemplate: sendWelcomeTemplate,
  sendWelcomeTemplateNonExistingNumber: sendWelcomeTemplateNonExistingNumber,
  sendMessageByTemplateId: sendMessageByTemplateId,
  sendAccessCodeTemplate: sendAccessCodeTemplate,
  sendDyamicMessage: sendDyamicMessage,
};
