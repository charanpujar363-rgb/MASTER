const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PORT = process.env.PORT || 3000;


// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <title>Kannada Exam Master</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px 20px;
                    background: #f5f5f5;
                }

                .box {
                    max-width: 500px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }

                h1 {
                    margin-bottom: 10px;
                }

                .price {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 20px;
                }
            </style>
        </head>

        <body>

            <div class="box">

                <h1>📚 Kannada Exam Master</h1>

                <p>
                    Premium Competitive Exam App
                </p>

                <div class="price">
                    ₹99
                </div>

                <p>
                    One-time Premium Unlock
                </p>

            </div>

        </body>
        </html>
    `);
});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (req, res) => {

    res.json({
        status: "ok"
    });
});


// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

app.post("/create-order", async (req, res) => {

    try {

        if (!KEY_ID || !KEY_SECRET) {

            return res.status(500).json({

                success: false,

                message:
                    "Razorpay environment variables missing"
            });
        }

        const amount = 9900;

        const receipt =
            "KEM_" + Date.now();

        const auth =
            Buffer
                .from(
                    `${KEY_ID}:${KEY_SECRET}`
                )
                .toString("base64");


        const razorpayResponse =
            await fetch(
                "https://api.razorpay.com/v1/orders",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Basic ${auth}`
                    },

                    body: JSON.stringify({

                        amount: amount,

                        currency: "INR",

                        receipt: receipt,

                        notes: {

                            product:
                                "Kannada Exam Master Premium"
                        }
                    })
                }
            );


        const data =
            await razorpayResponse.json();


        if (!razorpayResponse.ok) {

            console.error(
                "Razorpay order error:",
                data
            );

            return res.status(500).json({

                success: false,

                message:
                    "Razorpay order creation failed"
            });
        }


        res.json({

            success: true,

            order_id:
                data.id,

            amount:
                data.amount,

            currency:
                data.currency,

            key_id:
                KEY_ID
        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while creating order"
        });
    }
});


// ======================================================
// VERIFY PAYMENT
// ======================================================

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

                premium: false,

                message:
                    "Payment verification data missing"
            });
        }


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        const isValid =
            generatedSignature ===
            razorpay_signature;


        if (!isValid) {

            return res.status(400).json({

                success: false,

                premium: false,

                message:
                    "Invalid payment signature"
            });
        }


        console.log(
            "Payment verified:",
            razorpay_payment_id
        );


        return res.json({

            success: true,

            premium: true,

            message:
                "Payment verified successfully"
        });


    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );

        return res.status(500).json({

            success: false,

            premium: false,

            message:
                "Payment verification failed"
        });
    }
});


// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "Kannada Exam Master Backend is running"
        );

        console.log(
            `Server running on port ${PORT}`
        );
    }
);
