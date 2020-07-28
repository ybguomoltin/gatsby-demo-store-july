"use strict";

const { MoltinClient } = require("@moltin/request");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const client = new MoltinClient({
  client_id: process.env.PW_CLIENT_ID,
  client_secret: process.env.PW_CLIENT_SECRET
});

exports.handler = async function(event, context, callback) {
   const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST'
    };  
    
   try {
    
    const { token = "", email, password } = JSON.parse(event.body);
    console.log(token, email, password);  
    
    //look for customer
    const customerSearch = await client.get(
      `/customers?filter=eq(email,${email})`
    );

    console.log(customerSearch);
      
    if (customerSearch.data.length === 0)
       return  {
          statusCode: 400,
          headers,
          body: JSON.stringify({ statusCode: 400, error: "customer not found" })
       }
    const { sk_reset, id, email: useremail } = customerSearch.data[0];

    //verify and decrypt token
    const token_dec = jwt.verify(token, sk_reset)

    // create a new hash from password
    const new_sk = bcrypt.hashSync(password, 2);
    
    //update password & secret key
    await client.put(`/customers/${id}`, {
          type: "customer",
          password,
          sk_reset: new_sk
    });
    
    return  {
              statusCode: 200,
              headers,
              body: JSON.stringify({ statusCode: 200, message: "Your password has been reset." })
    } 
  } catch (e) {
    return  {
              statusCode: 500,
              headers,
              body: JSON.stringify({ statusCode: 500, message: e.message })
    }
  }    
};
