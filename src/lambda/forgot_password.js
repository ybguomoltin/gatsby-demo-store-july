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
  try {
    
    const { email = "" } = JSON.parse(event.body);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST'
    };
    
    //look for customer
    const customerSearch = await client.get(
      `/customers?filter=eq(email,${email})`
    );
    //return 400 if no customer found
    if (customerSearch.data.length === 0)
       return  {
          statusCode: 400,
          headers,
          body: JSON.stringify({ statusCode: 400, error: "customer not found" })
       }
    
    //get email, id and secret key
    const { sk_reset, id, email: useremail } = customerSearch.data[0];

    //generate a secret key if none exists or is empty string
    if (sk_reset === null || sk_reset === "") {  
      sk_reset = bcrypt.hashSync(useremail + Date.now(), 2);
      await client.put(`/customers/${id}`, {
        type: "customer",
        sk_reset: sk_reset
      });
    }
    
    const respBody = {
              statusCode: 200,
              headers,
              body: JSON.stringify({ statusCode: 200, message: "a link has been sent" })
    }
    //generate a JWT token, lasts 1 hour
    const token = jwt.sign({ id, useremail }, sk_reset, {expiresIn: "1h"})
    
    //send reset link to customer email
    await sendEmail({
            to: useremail,
            subject: "Password Reset Link",
            body: `Here's your link to reset password: https://epcc-pwa-demo.netlify.app/password_reset/${token}`
    });

    return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ statusCode: 200, message: "a link has been sent" })
    } 
  } catch (e) {
    return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ statusCode: 500, message: "There was a server error" })
    }
  }

};
