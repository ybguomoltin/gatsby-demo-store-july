const { ServerClient: PostmarkClient } = require('postmark')
const postmark = new PostmarkClient('b9ad037e-077e-4e53-a40c-6b6968bdaccb')

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

  switch(data.triggered_by)
  {
      case "order.created":
           console.log("order create")
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
           console.log(param.agent.email,param.agent.name,name,id,customer_email)
            await postmark.sendEmailWithTemplate({
              from: "yi.bin.guo@moltin.com",
              to: param.agent.email,
              templateId: "16794454",
              templateModel: {
                agent_name: param.agent.name,
                customer_name: name,
                order_ref: id,
                customer_email,
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
      break;
          
      case "order.updated":
        
          try {
           const {
              data: {
                id,
                customer: { email: customer_email, name: customer_name },
                stage,
                meta: {
                  display_price: {
                    with_tax: { formatted: order_total },
                  },
                },
              },
              included: { items },
            } = resource
           
           console.log(stage,param.agent.email,customer_email,customer_name, id)
              console.log("entering")
           if(stage==2){
               console.log("sending")
            const result = await postmark.sendEmailWithTemplate({
              from: "yi.bin.guo@moltin.com",
              to: customer_email,
              templateId: "16810518",
              templateModel: {
                customer_name,
                quote_id: id
              },
            })
            console.log(result)
             callback(null, {
          statusCode: 200,
          body: "OK",
        })
           }
           else if(stage == 3)
           {
              const result = await postmark.sendEmailWithTemplate({
              from: "yi.bin.guo@moltin.com",
              to: param.agent.email,
              templateId: "16811716",
              templateModel: {
                customer_name,
                quote_id: id,
                agent_name:param.agent.name,
              },
            })
            console.log(result)
             callback(null, {
          statusCode: 200,
          body: "OK",
        })
              
           }
            else if(stage == 4)
            {
              const result = await postmark.sendEmailWithTemplate({
              from: "yi.bin.guo@moltin.com",
              to: customer_email,
              templateId: "16811719",
              templateModel: {
                customer_name,
                quote_id: id,
                agent_name:param.agent.name,
              },
            })
            console.log(result)
             callback(null, {
          statusCode: 200,
          body: "OK",
        })
             
                
            }
              
              
              
              
          } catch ({ errors }) {
            callback(errors, {
          statusCode: 500,
          body:errors,
        })
        }
          
  
      break;
          
  }
    
}
    

