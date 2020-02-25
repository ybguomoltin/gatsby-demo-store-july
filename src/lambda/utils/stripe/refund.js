const stripe = require("stripe")('sk_test_1CC7nzLXWvBOzW1PQvUuFiID006HwoqZOl');

module.exports = async intentID => {
  try {
      console.log("Intent ID: ",intentID)
      const refunding = await stripe.refunds.create({
      payment_intent: intentID
    });
      return refunding.status
  } catch (e) {
    return e;
  }
};
