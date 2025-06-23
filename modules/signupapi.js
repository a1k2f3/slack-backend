import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../schema/user.js";
import validateSignup from "../middleware/MiddleWare.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import fetch from "node-fetch";
import crypto from "crypto";

const router = express.Router();
router.use(express.static("public"));

const imagesDir = path.join("public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const pendingUsers = new Map(); // In-memory storage for verification

export default (io) => {
  const upload = multer({ storage });

  router.post('/signup', upload.single("image"), validateSignup, async (req, res) => {
    try {
      const { username, email, phone, date_of_birth, password, confirmpassword, country,role } = req.body;
      const file = req.file;
      if (!username || !email || !password || !date_of_birth || !confirmpassword || !country||!role) {
        return res.status(400).json({ message: "All fields are required." });
      }
      if (password !== confirmpassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      const verifyUrl = `http://apilayer.net/api/check?access_key=3566824110ee2c3cd94dcfb4397597c2&email=${email}&smtp=1&format=1`;
      const response = await fetch(verifyUrl);
      const data = await response.json();

      if (!data.smtp_check || !data.mx_found || !data.format_valid) {
        return res.status(400).json({ message: "Invalid or unreachable email address." });
      }

      const existingUser = await Accounts.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }
     const hashedPassword = await bcrypt.hash(password, 10);

      // Generate token and save user temporarily
      const token = crypto.randomBytes(32).toString("hex");
      pendingUsers.set(token, {
        username,
        email,
        phone,
        date_of_birth,
        country,
        password: hashedPassword,
        image: file?.filename || ""
      });

      // Optional: Remove token after 15 mins
      setTimeout(() => pendingUsers.delete(token), 15 * 60 * 1000);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification - Confirm Your Account",
        html: `
          <h2>Hi ${username},</h2>
          <p>Please click the button below to verify your email and activate your account:</p>
          <a href="https://skyride.onrender.com/api/verify?token=${token}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
          <p>If you did not request this, please ignore.</p>
        `
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email failed to send:", err);
          return res.status(400).json({ message: "Email verification failed to send." });
        }
        res.status(200).json({ message: "Verification email sent. Please check your inbox." });
      });

    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Server error." });
    }
  });

  // ✅ Verify Email Endpoint
  router.get('/verify', async (req, res) => {
    const token = req.query.token;
    const userData = pendingUsers.get(token);

    if (!userData) {
      return res.status(400).send("Invalid or expired token.");
    }

    try {
      const existingUser = await Accounts.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).send("Account already verified.");
      }

      const newUser = new Accounts(userData);
      await newUser.save();
      pendingUsers.delete(token);

      io.emit("user signup", { email: userData.email, name: userData.username });

      res.send("✅ Your account has been verified and created successfully!");
    } catch (error) {
      console.error("Error in verification:", error);
      res.status(500).send("Internal server error.");
    }
  });

  return router;
};
