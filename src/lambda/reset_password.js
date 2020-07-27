const { send, json } = require("micro");
const cors = require("micro-cors")();
const { MoltinClient } = require("@moltin/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const client = new MoltinClient({
  client_id: "a2SyrXlQn1HzaH27am93RPzt7hSslNXRYGRy5o5THB",
  client_secret: "SpYDhGamemK5SjgopkBxQqlyiT3EBCp6Zcf9PmeBmd"
});

module.exports = cors(async (req, res) => {
  console.log(req.body);
  const { token = "", email, password } = req.body;

  console.log(token, email, password);
  try {
    //look for customer

    const customerSearch = await client.get(
      `/customers?filter=eq(email,${email})`
    );

    console.log(customerSearch);
    if (customerSearch.data.length === 0)
      return send(res, 400, { statusCode: 400, message: "customer not found" });
    let { sk_reset, id, email: useremail } = customerSearch.data[0];

    jwt.verify(token, sk_reset, async function(err, token_dec) {
      console.log(token_dec);
      if (err) return send(res, 400, { statusCode: 400, message: err.message });
      else {
        // create a new hash from password
        let new_sk = bcrypt.hashSync(password, 2);
        await client.put(`/customers/${id}`, {
          type: "customer",
          password,
          sk_reset: new_sk
        });
        return send(res, 200, {
          statusCode: 200,
          message: "Password has been reset"
        });
      }
    });
  } catch (e) {
    return send(res, 500, {
      statusCode: 500,
      message: "There was a server error"
    });
  }
});
