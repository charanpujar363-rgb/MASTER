const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Home page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kannada Exam Master</title>
    </head>
    <body style="font-family:Arial;text-align:center;padding:40px">
      <h1>📚 Kannada Exam Master</h1>
      <p>Premium Competitive Exam App</p>
      <p>₹99 Premium Unlock</p>
    </body>
    </html>
  `);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create Razorpay Order
app.post("/create-order", async (req, res) => {
  try {
    if (!KEY_ID || !KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are missing"
      });
    }

    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: 9900,
        currency: "INR",
        receipt: `KEM_${Date.now()}`,
        notes: {
          product: "Kannada Exam Master Premium"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.description || "Order creation failed"
      });
    }

    res.json({
      success: true,
      order_id: data.id,
      amount: data.amount,
      key_id: KEY_ID
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Verify Razorpay Payment
app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details missing"
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    console.log("PAYMENT VERIFIED:", razorpay_payment_id);

    res.json({
      success: true,
      premium: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Kannada Exam Master Backend is running");
});
