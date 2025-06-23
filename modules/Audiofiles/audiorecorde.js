import express from 'express';
import multer from 'multer';
import fs from 'fs';
import AudioCall from '../../schema/AudioCall.js'; // adjust path as needed
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/audio';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `call-${Date.now()}.webm`);
  }
});
const upload = multer({ storage });
router.post('/save-audio', upload.single('audio'), async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!req.file || !senderId || !receiverId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newAudio = new AudioCall({
      senderId,
      receiverId,
      filePath: req.file.path,
    });
    await newAudio.save();
    res.status(200).json({ message: "Audio saved", data: newAudio });

  } catch (error) {
    console.error("❌ Error saving audio:", error);
    res.status(500).json({ error: "Failed to save audio" });
  }
});

export default router;
