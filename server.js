const express = require("express");

const app = express();

app.use(express.json());

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay API keys are missing");
}

// Home
app.get("/", (req, res) => {
    res.send("Kannada Exam Master Backend is running");
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// Create ₹99 Razorpay Order
app.post("/create-order", async (req, res) => {
    try {
        const amount = 9900; // ₹99

        const auth = Buffer
            .from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
            .toString("base64");

        const response = await fetch(
            "https://api.razorpay.com/v1/orders",
            {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: "INR",
                    receipt: `KEM_${Date.now()}`,
                    notes: {
                        product: "Kannada Exam Master Premium"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                error: data
            });
        }

        res.json({
            success: true,
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            keyId: RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Unable to create payment order"
        });
    }
});

// Verify Razorpay payment
app.post("/verify-payment", async (req, res) => {
    try {
        const crypto = require("crypto");

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
                error: "Missing payment details"
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const verified =
            generatedSignature === razorpay_signature;

        if (!verified) {
            return res.status(400).json({
                success: false,
                verified: false
            });
        }

        res.json({
            success: true,
            verified: true,
            premium: true,
            message: "Payment verified successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Payment verification failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
