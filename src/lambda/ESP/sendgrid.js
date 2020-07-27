const SendGridClient = require("@sendgrid/mail");
SendGridClient.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async ({ to, subject, body }) => {
  if (to === undefined || subject === undefined || body === undefined) {
    return {
      statusCode: 401,
      body: "Missing to, subject or body"
    };
  }
  try {
    const msg = {
      to,
      from: "yi.guo@elasticpath.com",
      subject,
      text: body
    };
    console.log(msg);
    return await SendGridClient.send(msg);
  } catch (e) {
    return e;
  }
};
