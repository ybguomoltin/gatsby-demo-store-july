const stripeRefund = require("../stripe/refund");


module.exports = async (event, moltinClient) => {
  try {
    
    const body = JSON.parse(event.body);
    const resources = JSON.parse(body.resources);
    const orderID = resources.data.id;
      console.log("Order ID: ", orderID)
    const transactions = await moltinClient.get(
      "orders/" + orderID + "/transactions"
    );
console.log("transactions: ", transactions)
    const [{ reference, gateway }] = await transactions.data.filter(
      transaction => transaction["transaction_type"] === "refund"
    );
      
      
    console.log('gateway:', gateway, reference);
    switch (gateway) {
      case "stripe_payment_intents":
        
        return stripeRefund(reference);

      case "braintree":
        console.log("gateway is braintree");
        

      default:
        throw new Error(gateway + " gateway not found");
    }
  } catch (e) {
    throw new Error(e);
  }
};
