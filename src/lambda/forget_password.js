"use strict";
const { MoltinClient } = require("@moltin/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require('./ESP/sendgrid')
const client = new MoltinClient({
  client_id: process.env.PW_CLIENT_ID,
  client_secret: process.env.PW_CLIENT_SECRET
});

exports.handler = async function(event, context, callback) {
  
  const { email = "" } = JSON.parse(event.body);
  
  try {
    //look for customer
    const customerSearch = await client.get(
      `/customers?filter=eq(email,${email})`
    );

    console.log(customerSearch);
    if (customerSearch.data.length === 0)
       return  {
          statusCode: 400,
          body: JSON.stringify({ statusCode: 400, error: "customer not found" })
       }
    let { sk_reset, id, email: useremail } = customerSearch.data[0];

    //if no reset key, generate a new one
    if (sk_reset === null) {  
      sk_reset = bcrypt.hashSync(useremail + Date.now(), 2);
      await client.put(`/customers/${id}`, {
        type: "customer",
        sk_reset: sk_reset
      });
    }
    
     let respBody = {
              statusCode: 200,
              body: JSON.stringify({ statusCode: 200, message: "a link has been sent" })
     } 
     const token = jwt.sign({ id, useremail },sk_reset, {expiresIn: "1h"})
      
     await sendEmail({
            to: useremail,
            subject: "Password Reset Link",
            body: `Here's your link to reset password: https://epcc-pwa-demo.netlify.app/password_reset/${token}`
       });

     return {
              statusCode: 200,
              body: JSON.stringify({ statusCode: 200, message: "a link has been sent" })
     } 
  } catch (e) {
     return {
          statusCode: 500,
          body: JSON.stringify({ statusCode: 500, message: "There was a server error" })
     }
  }

};
