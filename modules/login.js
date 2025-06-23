import express from "express";
import bcrypt from "bcryptjs";
import Accounts from "../schema/user.js"; // Verify this path
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fetch from "node-fetch";
import crypto from "crypto";
import user from "../schema/user.js";
import mongoose from "mongoose"; // Import mongoose
import multer from 'multer';
import path from "path";
import fs from "fs";
const router = express.Router();
export default(io,onlineUsers)=>{
  const pendinglogin = new Map(); 
router.post("/login", async (req, res) => {
  try { 
    const { email,password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const existingUser = await Accounts.findOne({ email: email });
  if (!existingUser) {
    return res.status(400).send("Invalid email or password");
  }
  const validation = await bcrypt.compare(password,existingUser.password);
  if (!validation) {
    return res.status(400).send("Invalid email or password");
  }
  const token = jwt.sign(
    { id: existingUser._id, email: existingUser.email },
    process.env.JWT_SECRET || "your_jwt_secret", // Replace with your secret
    { expiresIn: '1h' } // Adjust the expiration time to something reasonable like 1 hour
  );
  res.status(200).json({ message: "User login successful",  user: existingUser, token, id:existingUser.id});
  for(const [SockId,user] of onlineUsers.entries() ){
    if(user.email !== email){
      io.to(SockId).emit("user_logged_in", {
        id: existingUser.id,
        email: existingUser.email,
      });
      console.log("User logged in", user.email);
    }
  }
const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: " Your have  Login to your acount",
      html: `
        <h2>Hi ${email},</h2>
        <p> you login to your acount</p>
       
      `
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email failed to send:", err);
        return res.status(400).json({ message: "Email verification failed to send." });
      }
      res.status(200).json({ message: "Verification email sent. Please check your inbox and verify its you." });
    });
    
  
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});
const pendingUsers = new Map(); 

router.use(express.static("public"));

const imagesDir = path.join("public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir); // Or your desired path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
router.put("/updateaccount/:id", upload.single("image"), async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;
    const file = req.file;

    // Handle location as a GeoJSON Point (expects JSON string from frontend)
    let location = undefined;
    if (req.body.location) {
      const loc = JSON.parse(req.body.location); // Example: { "type": "Point", "coordinates": [74.3587, 31.5204] }
      location = loc;
    }

    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(password && { password }),
      ...(role && { role }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(file && { image: file.filename }),
    };

    const updatedAccount = await Accounts.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.status(200).json({ message: "Account updated successfully.", account: updatedAccount });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});


router.get("/getaccount/:id", async (req, res) => {
  const { id } = req.params;
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid account ID." });
  }

  try {
    const account = await Accounts.findById(id);

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
router.put("/updatepassword", async (req, res) => {
  try {
    const { password,email} = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
// Generate token and save user temporarily
const token = crypto.randomBytes(32).toString("hex");
pendingUsers.set(token, {
  email,
  password: hashedPassword,
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
    <h2>Hi ${email},</h2>
    <p>Please click the button below to verify your email and update your password your account:</p>
    <a href="https://skyride.onrender.com/api/verify/updatepassword?token=${token}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
    <p>If you did not request this, please ignore.</p>
  `
};
transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("Email failed to send:", err);
    return res.status(400).json({ message: "Email verification failed to send." });
  }
  res.status(200).json({ message: "Verification email sent. Please check your inbox and verify its you." });
});

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get('/verify/updatepassword', async (req, res) => {
  const token = req.query.token;
  const userData = pendingUsers.get(token);

  if (!userData) {
    return res.status(400).send("Invalid or expired token.");
  }

  try {
    const existingUser = await Accounts.findOne({ email: userData.email });
    if (!existingUser) {
      return res.status(400).send("your email not found.");
    }

    
    const updatedAccount = await Accounts.findOneAndUpdate(
     {email:userData.email},
      { password: userData.password },
      { new: true }
    );
    await updatedAccount.save();
    pendingUsers.delete(token);

    io.emit("user update password correctly", { email: userData.email, name: userData.username });

    res.send("✅ Your password has been updated successfully!");
  } catch (error) {
    console.error("Error in verification:", error);
    res.status(500).send("Internal server error.");
  }
})
router.delete("/deleteaccount/:id", async (req, res)  => {
  try {
    const { id } = req.params;
    const deletedAccount = await Accounts.findByIdAndDelete(id);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error." });
  }});
  return router;
}
