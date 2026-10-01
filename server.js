const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kannada Exam Master</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background: #f5f7fb;
      color: #222;
    }
    header {
      background: #173b7a;
      color: white;
      padding: 35px 20px;
      text-align: center;
    }
    .container {
      max-width: 900px;
      margin: auto;
      padding: 30px 20px;
    }
    .card {
      background: white;
      padding: 25px;
      margin: 18px 0;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    h1 { margin-bottom: 10px; }
    h2 { color: #173b7a; }
    .price {
      font-size: 28px;
      font-weight: bold;
      color: #16803a;
    }
    footer {
      text-align: center;
      padding: 25px;
      background: #173b7a;
      color: white;
    }
  </style>
</head>

<body>

<header>
  <h1>Kannada Exam Master</h1>
  <p>Kannada Competitive Exam Preparation App</p>
</header>

<div class="container">

  <div class="card">
    <h2>About Kannada Exam Master</h2>
    <p>
      Kannada Exam Master is a mobile application designed to help
      students prepare for competitive examinations through Kannada
      language study materials, practice questions and mock tests.
    </p>
  </div>

  <div class="card">
    <h2>Examinations</h2>
    <ul>
      <li>KPSC</li>
      <li>Police Recruitment</li>
      <li>PDO</li>
      <li>FDA / SDA</li>
      <li>Mock Tests</li>
      <li>Current Affairs</li>
    </ul>
  </div>

  <div class="card">
    <h2>Premium Access</h2>
    <p>
      Premium access provides additional practice questions and
      exam preparation content inside the Kannada Exam Master app.
    </p>
    <p class="price">₹99 One-Time Premium Unlock</p>
  </div>

  <div class="card">
    <h2>Contact</h2>
    <p>
      For support regarding Kannada Exam Master, please contact the
      application support team.
    </p>
  </div>

</div>

<footer>
  © 2026 Kannada Exam Master
</footer>

</body>
</html>
  `);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Kannada Exam Master website running");
});
