const { ServerClient: PostmarkClient } = require('postmark')
const postmark = new PostmarkClient('b9ad037e-077e-4e53-a40c-6b6968bdaccb')

exports.handler = async function(event, context, callback) {
  // Function code goes here
  
  const resource = JSON.parse(event.body);
    console.log(resource)

  
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
    callback(null, {
  statusCode: 200,
  body: "OK",
})
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
