require("dotenv").load();

const braintree = require("braintree");

const gateway = braintree.connect({
  environment: braintree.Environment.Production,
  merchantId: process.env.BRAINTREE_MERCHANTID,
  publicKey: process.env.BRAINTREE_PUBLICKEY,
  privateKey: process.env.BRAINTREE_PRIVATEKEY
});

module.exports = async transactionID => {
  try {
    return await gateway.transaction.refund(transactionID);
  } catch (e) {
    return e;
  }
};
