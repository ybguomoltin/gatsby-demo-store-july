const stripe = require("stripe")("sk_test_1CC7nzLXWvBOzW1PQvUuFiID006HwoqZOl");
const { MoltinClient } = require("@moltin/request");
const client = new MoltinClient({
  client_id: "a2SyrXlQn1HzaH27am93RPzt7hSslNXRYGRy5o5THB",
  client_secret: "SpYDhGamemK5SjgopkBxQqlyiT3EBCp6Zcf9PmeBmd"
});

function throwException(e) {
  throw e;
}
exports.handler = async function(event,context,callback) {
    
  try {
    const json_body=JSON.parse(event.body)
    
    if (json_body.data.object.paid !== true)
        return { statusCode: 400, body: "Payment not processed" };
      
    const {
      data: {
        object: {
          id: stripe_invoice_id,
          charge: custom_reference,
          subscription: sub_id,
          hosted_invoice_url: stripe_invoice_url,
          customer: stripe_customer_id,
          billing_reason: stripe_billing_reason,
          lines: {
            data: [
              {
                plan: {
                  id: priceID,
                  metadata: { ep_id: ep_product_id }
                }
              }
            ]
          }
        }
      }
    } = json_body;

    const {
      metadata: { ep_id: ep_customer_id },
      shipping: {
        phone: phone_number = "",
        name: first_name,
        last_name = "",
        address: {
          line1: line_1,
          line2: line_2,
          state: county,
          postal_code: postcode,
          ...rest
        }
      },
      address: {
        line1: bline_1,
        line2: bline_2,
        state: bcounty,
        postal_code: bpostcode,
        ...brest
      }
    } = await stripe.customers.retrieve(stripe_customer_id);

    let checkout = {
      customer: { id: ep_customer_id },
      sub_id,
      stripe_invoice_id,
      stripe_invoice_url,
      stripe_billing_reason,
      billing_address: {
        first_name,
        last_name,
        line_1,
        line_2,
        county,
        postcode,
        ...rest
      },
      shipping_address: {
        first_name,
        last_name,
        line_1: bline_1,
        line_2: bline_2,
        phone_number,
        county: bcounty,
        postcode: bpostcode,
        ...brest
      }
    };

    //console.log(checkout);

    let cart_content = {
      type: "cart_item",
      id: ep_product_id,
      quantity: 1
    };
    //console.log(cart_content);
    await client.delete(`carts/${sub_id}`).catch(throwException);
    const cart = await client
      .post(`carts/${sub_id}/items`, cart_content)
      .catch(throwException);
    console.log(cart);

    const {
      data: order,
      data: { id: order_id }
    } = await client
      .post(`carts/${sub_id}/checkout`, checkout)
      .catch(throwException);

    const {
      data: { id: transaction_id }
    } = await client
      .post(`orders/${order_id}/payments`, {
        gateway: "manual",
        method: "authorize"
      })
      .catch(throwException);

    const transaction = await client
      .post(`orders/${order_id}/transactions/${transaction_id}/capture`, {
        gateway: "manual",
        method: "capture",
        custom_reference
      })
      .catch(throwException);

    return { statusCode: 200, body: JSON.stringify({ep_transaction: transaction, ep_order: order}) }
  
  } catch (e) {
    return { statueCode: 500, body: e }
  }

  //res.status(200).json({ message: "Payment received" });
  /*
  await stripe.invoices.pay("in_1Gq2RHAIko80q27oN4sDXILd", function(
    err,
    invoice
  ) {
    // asynchronously called
  });
  */
};
