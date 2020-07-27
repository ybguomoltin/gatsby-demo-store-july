const { send } = require("micro");
const cors = require("micro-cors")();
const { MoltinClient } = require("@moltin/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const sendEmail = require("./ESP/sendgrid");
const client = new MoltinClient({
  client_id: process.env.PW_CLIENT_ID,
  client_secret: process.env.PW_CLIENT_SECRET
});
exports.handler = cors(async (req, res) => {
  const { email = "" } = req.body;
  try {
    //look for customer
    const customerSearch = await client.get(
      `/customers?filter=eq(email,${email})`
    );

    console.log(customerSearch);
    if (customerSearch.data.length === 0)
      return send(res, 400, { statusCode: 400, error: "customer not found" });
    let { sk_reset, id, email: useremail } = customerSearch.data[0];

    //if no reset key, generate a new one
    if (sk_reset === null) {
      sk_reset = bcrypt.hashSync(useremail + Date.now(), 2);
      await client.put(`/customers/${id}`, {
        type: "customer",
        sk_reset: sk_reset
      });
    }

    jwt.sign(
      { id, useremail },
      sk_reset,
      {
        expiresIn: "1h"
      },
      function(err, token_enc) {
        console.log(token_enc);
        if (err) send(res, 400, { statusCode: 400, message: err.message });
        else {
          sendEmail({
            to: useremail,
            subject: "Password Reset Link",
            body: `Here's your link to reset password: https://epcc-pwa-demo.netlify.app/password_reset/${token_enc}`
          });
          send(res, 200, {
            statusCode: 200,
            message: "A reset link has been sent."
          });
        }
      }
    );
  } catch (e) {
    send(res, 500, { statusCode: 500, message: "there was a server error" });
  }
});
