const { ServerClient: PostmarkClient } = require('postmark')
//const postmark = new PostmarkClient('b9ad037e-077e-4e53-a40c-6b6968bdaccb')
const twilio = require('twilio')

const twilioClient = new twilio(
    "AC7d03bbe7285cf44807b1328be4d71efb",
    "3a10814e0493858434cfe4b7258748c3"
  )  
    
exports.handler = async function(event, context, callback) {
  // Function code goes here
   console.log(event)
  const param = await JSON.parse(event.headers['x-moltin-secret-key'])
  if (param == "") {
  return callback(null, {
  statusCode: 401,
  body: "empty header",
})
  }
console.log("passed header check")
    console.log(param)
  const data = JSON.parse(event.body);
  const resource = JSON.parse(data.resources);
    //console.log(resource)

       try {
           const {
              data: {
                id,
                customer: { email: customer_email, name },
                meta: {
                  display_price: {
                    with_tax: { formatted: order_total },
                  },
                },
              },
              included: { items },
            } = resource
           console.log(param.customer.cell)
            const body = await twilioClient.messages.create({
              to: param.customer.cell,
              from: '+18722137242',
              body: param.message,
            })
            console.log(body)
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
    

    

