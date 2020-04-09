
const { ServerClient: PostmarkClient } = require('postmark')
const postmark = new PostmarkClient(process.env.POSTMARK_AUTH_TOKEN)

exports.handler = async function(event, context, callback) {

  console.log(event)

  if (event.headers['x-moltin-secret-key'] == "") {
    return {
      statusCode: 401,
      body: "Missing X-MOLTIN-SECRET-KEY",
    }
  }
    
  const param = await JSON.parse(event.headers['x-moltin-secret-key'])    
  if(!param.hasOwnProperty("auth_key") || !param.hasOwnProperty("postmark_template_id") || param.auth_key !== process.env.POSTMARK_AUTH_KEY){
    return {
            statusCode: 401,
            body: "Missing or AUTH_KEY or PM_TEMPLATE_ID, or AUTH_KEY provided is incorrect.",
    }
  }

    
  try {
      
    const body = JSON.parse(event.body);
    const resource = JSON.parse(body.resources);  
    
    const {
      data,
      included: { items },
    } = resource
            
    await postmark.sendEmailWithTemplate({
       from: "yi.guo@elasticpath.com",
       to: data.customer.email,
       templateId: param.postmark_template_id,
       templateModel: {
           order_data: data,
           order_items: items,
       },
    })
        
      return  {
        statusCode: 200,
        body: `${data.id},${param.postmark_template_id},${new Date().getTime()}`,
    }
      
  } catch ({ errors }) {
    callback(errors, {
          statusCode: 500,
          body:errors,
    })
  }
}
    

