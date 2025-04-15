
const express = require('express');
const router = express.Router();
const braintree = require('braintree');


  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    
    // Use your own credentials from the sandbox Control Panel here
    merchantId: 'xfv6b2t5jzk9vv2m',
    publicKey: '4kx9s2ndfdw9c9ys',
    privateKey: 'bb422bb85d5d09e8b6160586ddfd3aa3'
  });

  router.get("/", (req, res) => {
    gateway.clientToken.generate({}, (err, response) => {
      res.send(response.clientToken);
    });
  });
  router.post('/', async (req, res, next) => {
    const { paymentMethodNonce, amount } = req.body;
    console.log("Received payment request:", { paymentMethodNonce, amount });

  if (!paymentMethodNonce || !amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ success: false, error: 'Invalid or missing payment data' });
  }
  try {
    const result = await gateway.transaction.sale({
      amount: amount,  // use the dynamic amount here
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    });
    if (result.success) {
      res.json({ success: true, transaction: result.transaction });
    } else {
      res.status(500).json({ success: false, error: result.message });
    }
  } catch (err) {
    console.error("Payment processing error:", err);
    res.status(500).json({ success: false, error: "Payment processing error" });
  }
});

module.exports = router;
