// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const { MongoClient, ObjectId } = require("mongodb");
// const url = process.env.MONGO_URI || "mongodb://localhost:27017/";
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const client = new MongoClient(url);
// const dbname = "Hack4Delhi";
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const nodemailer = require("nodemailer");
// const bcrypt = require("bcrypt");
// dotenv.config();
// const { encrypt, decrypt } = require("./cryptoutils");
// const { parseConnectionUrl } = require("nodemailer/lib/shared");

// app.use(cookieParser());
// const port = 3000;





// 1. Load dotenv FIRST
const dotenv = require("dotenv");
dotenv.config();

// 2. Then import everything else
const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

// Now this will correctly grab the URI from your .env file
const url = process.env.MONGO_URI || "mongodb://localhost:27017/";

const cors = require("cors");
const jwt = require("jsonwebtoken");
const client = new MongoClient(url);
const dbname = "Hack4Delhi";
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const { encrypt, decrypt } = require("./cryptoutils");
const { parseConnectionUrl } = require("nodemailer/lib/shared");

app.use(cookieParser());
const port = 3000;




app.use(bodyParser.json());

client.connect().then(() => {
  const db = client.db(dbname);
  db.collection("Sessions").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600 }
  );
  db.collection("otps").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 300 }
  );
});
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

app.use(cors({
  origin: ["http://localhost:5174", "http://127.0.0.1:5173", "http://localhost:5173"],
  credentials: true
}));

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL || "",
    pass: process.env.AUTH_PASS || "",
  },
});

const otpverification = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error in OTP verification:", error);
  }
};

router.post("/change-password", async (req, res) => {
  const { email, password } = req.body;
  const db = client.db(dbname);
  const user = await db.collection("Users").findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .collection("Users")
    .updateOne(
      { email: email },
      { $set: { password: hashedPassword } },
      { upsert: true }
    );
  const token = jwt.sign({ email: email, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: email, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true, message: "Email sent successfully", username: user.username });
});
router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");
  const existing = await collection.findOne({ email: email });
  console.log(email);
  if (existing) {
    console.log(email)
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const otp = await otpverification(email);
  if (!otp) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }


  await db
    .collection("otps")
    .updateOne(
      { email: email },
      { $set: { otp: otp, createdAt: new Date() } },
      { upsert: true }
    );

  res.status(200).json({ success: true, message: "Email sent successfully" });
});

router.post("/send-emailforgot", async (req, res) => {
  const { email } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");
  const existing = await collection.findOne({ email: email });
  console.log(email);


  const otp = await otpverification(email);
  if (!otp) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }


  await db
    .collection("otps")
    .updateOne(
      { email: email },
      { $set: { otp: otp, createdAt: new Date() } },
      { upsert: true }
    );

  res.status(200).json({ success: true, message: "Email sent successfully" });
});


app.get("/", async (req, res) => {
  const user = req.query.user;
  const db = client.db(dbname);
  const collection = db.collection("passwords");
  const findresult = await collection.find({ user: user }).toArray();
  const decryptedResults = findresult.map(entry => ({
    id: entry.id,
    site: decrypt(entry.site),
    username: decrypt(entry.username),
    password: decrypt(entry.password),
    user: entry.user,
  }));

  res.json(decryptedResults);
});


router.post("/login", async (req, res) => {
  const { user, password } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");

  const found = await collection.findOne({ email: user });
  const username = found.username;
  console.log(username)
  if (!found) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, found.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ email: user, username: username, role: found.role || "student" }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: user, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true, username: username, role: found.role || "student" });
});

router.delete("/logout", async (req, res) => {
  console.log("here")
  const db = client.db(dbname);
  const collection = db.collection("Sessions");
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token not found in cookies" });
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;
  const result = await collection.deleteOne({ email: email, token: token });

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    deleted: result.deletedCount,
  });
});

router.get("/verify", async (req, res) => {
  const db = client.db(dbname);
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ success: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = await db
      .collection("Sessions")
      .findOne({ email: payload.email, token });

    if (!session) return res.status(403).json({ success: false });

    res.json({ success: true, email: payload.email, username: payload.username, role: payload.role });
  } catch (err) {
    return res.status(403).json({ success: false });
  }
});
app.use(router);


app.post("/signupforgot", async (req, res) => {
  const user = req.body;
  const db = client.db(dbname);
  const userCollection = db.collection("Users");
  const otpCollection = db.collection("otps");
  const sessionCollection = db.collection("Sessions");


  try {
    console.log(user.email)
    const stored = await otpCollection.findOne({ email: user.email });
    const isExpired = new Date() - new Date(stored.createdAt) > 5 * 60 * 1000;

    if (isExpired) {
      return res
        .status(410)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (!stored) return res.status(400).json({ message: "Email not found." });
    if (stored.otp != user.otp) {

      return res.status(401).json({ message: "Invalid OTP." });
    }
    await otpCollection.deleteOne({ email: user.email });



    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.post("/signup", async (req, res) => {
  const user = req.body;
  const db = client.db(dbname);
  const userCollection = db.collection("Users");
  const otpCollection = db.collection("otps");
  const sessionCollection = db.collection("Sessions");


  try {
    console.log(user.email)
    const stored = await otpCollection.findOne({ email: user.email });
    const isExpired = new Date() - new Date(stored.createdAt) > 5 * 60 * 1000;

    if (isExpired) {
      return res
        .status(410)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (!stored) return res.status(400).json({ message: "Email not found." });
    if (stored.otp != user.otp) {

      return res.status(401).json({ message: "Invalid OTP." });
    }
    await otpCollection.deleteOne({ email: user.email });
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await userCollection.insertOne({
      email: user.email,
      username: user.username,
      password: hashedPassword,
      institution: user.institution,

      password: hashedPassword,
      institution: user.institution,
      role: "student",
    });
    const token = jwt.sign({ email: user.email, username: user.username, role: "student" }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    await sessionCollection.insertOne({
      email: user.email,
      token,
      createdAt: new Date(),
      institution: user.institution,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});







// --- Followed Wards Endpoints ---

// Middleware to authenticate token
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

router.get("/get-wards", authenticate, async (req, res) => {
  const db = client.db(dbname);
  try {
    const user = await db.collection("Users").findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, wards: user.followedWards || [] });
  } catch (err) {
    console.error("Error fetching wards:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/add-ward", authenticate, async (req, res) => {
  const { wardName } = req.body;
  if (!wardName) return res.status(400).json({ success: false, message: "Ward name required" });

  const db = client.db(dbname);
  try {
    await db.collection("Users").updateOne(
      { email: req.user.email },
      { $addToSet: { followedWards: wardName } } // addToSet prevents duplicates
    );
    res.json({ success: true, message: "Ward added" });
  } catch (err) {
    console.error("Error adding ward:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/remove-ward", authenticate, async (req, res) => {
  const { wardName } = req.body;
  if (!wardName) return res.status(400).json({ success: false, message: "Ward name required" });

  const db = client.db(dbname);
  try {
    await db.collection("Users").updateOne(
      { email: req.user.email },
      { $pull: { followedWards: wardName } }
    );
    res.json({ success: true, message: "Ward removed" });
  } catch (err) {
    console.error("Error removing ward:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

