const { ServerClient: PostmarkClient } = require('postmark')
const postmark = new PostmarkClient('b9ad037e-077e-4e53-a40c-6b6968bdaccb')
const { createClient } = require('@moltin/request')

const client = new createClient({
  client_id: "ezr5VY5bavmrYnwIXU8EoSFvSn16vIhxhUh4ZhND1y",
  client_secret: "idKPDDXqKu7Fylgj8Z6x2AyMBSBYcoqpiyB3OZmoJB",
    
})

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

exports.handler = async function(event, context, callback) {
  // Function code goes here
  
  const data = JSON.parse(event.body);
  const resource = JSON.parse(data.resources);
    console.log(resource)
    
  try {
   const {
      data: {
        id,
        customer: { email: to, name },
        meta: {
          display_price: {
            with_tax: { formatted: order_total },
            without_tax: { amount: card_amount }
          },
        },
      },
      included: { items },
    } = resource

   const resp = await client.post('promotions',{ 
      name: 'Gift Card - Order'+id, 
      description: 'test', 
      type: 'promotion', 
      promotion_type:'fixed_discount', 
      enabled: true, 
      start:'2019-01-01', 
      end:'2050-01-01', 
      schema: { 
          currencies: [
              {
                  currency: "AUD", 
                  amount: card_amount/2 
              }
          ]
      }
  })
    const codeuid = uuidv4();
     
    const x = await client.post( `promotions/${resp.data.id}/codes`,{ 
      type: 'promotion_codes', 
      codes: [{code: codeuid}]
      }
  )
      
   await postmark.sendEmailWithTemplate({
      from: 'yi.bin.guo@moltin.com',
      to,
      templateId: '15004209',
      templateModel: {
        customer_name: name,
        order_ref: id,
        order_total,
        order_items: items,
        gift_code: codeuid,
        gift_card_amount: card_amount/200,
        
      },
    })
    return {
        statusCode: 200,
        body: 'ok',
    }
  } catch ({ errors }) {
    callback(errors, {
      statusCode: 500,
      body:errors,
    })
  }
    
}

/*
module.exports = cors(async (req, res) => {
  if (
    (await req.headers['x-moltin-secret-key']) !=
    process.env.MOLTIN_WEBHOOK_SECRET
  )
    return send(res, 401)

  const data = await json(req)

  const resource = JSON.parse(data.resources)

  try {
    const {
      data: {
        id,
        customer: { email: to, name },
        meta: {
          display_price: {
            with_tax: { formatted: order_total },
          },
        },
      },
      included: { items },
    } = resource
    await postmark.sendEmailWithTemplate({
      from: 'yi.bin.guo@moltin.com',
      to,
      templateId: '14886482',
      templateModel: {
        customer_name: name,
        order_ref: id,
        order_total,
        order_items: items,
      },
    })


    send(res, 201)
  } catch ({ errors }) {
    send(res, 500, errors)
  }
})
*/
