// routes/checkout.js
const express = require('express');
const router = express.Router();
const braintree = require('braintree');

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'xfv6b2t5jzk9vv2m',
  publicKey:  '4kx9s2ndfdw9c9ys',
  privateKey: 'bb422bb85d5d09e8b6160586ddfd3aa3'
});

// GET /checkout — returns a client token to initialize the Drop‑in UI
router.get('/', (req, res) => {
  gateway.clientToken.generate({}, (err, { clientToken }) => {
    if (err) {
      console.error('Error generating client token:', err);
      return res.status(500).json({ success: false, error: 'Could not generate token' });
    }
    res.send(clientToken);
  });
});

// POST /checkout — processes a transaction
router.post('/', async (req, res) => {
  const { paymentMethodNonce, amount, paymentId } = req.body;

  // Basic validation
  if (!paymentMethodNonce || !amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ success: false, error: 'Invalid or missing payment data' });
  }

  try {
    const result = await gateway.transaction.sale({
      amount: paymentId ? amount : amount, // still dynamic
      paymentMethodNonce,
      options: { submitForSettlement: true }
    });

    if (result.success) {
      // Return success + transaction + echo back paymentId
      return res.json({
        success: true,
        transaction: result.transaction,
        paymentId: paymentId || null
      });
    } else {
      console.error('Braintree failed:', result.message);
      return res.status(502).json({ success: false, error: result.message });
    }
  } catch (err) {
    console.error('Payment processing error:', err);
    return res.status(500).json({ success: false, error: 'Payment processing error' });
  }
});

module.exports = router;
