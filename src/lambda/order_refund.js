"use strict";
const logic = require("./utils/generic/logic");
const { MoltinClient } = require('@moltin/request')


const moltinClient = new MoltinClient({
  client_id: 'ezr5VY5bavmrYnwIXU8EoSFvSn16vIhxhUh4ZhND1y',
  client_secret: 'idKPDDXqKu7Fylgj8Z6x2AyMBSBYcoqpiyB3OZmoJB'
});

exports.handler = async (event, context, callback) => {
  console.log(JSON.parse(event.body))
  try {
    console.log('sdfsdf')
    let response = await logic(event, moltinClient);

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    };
  }
};
