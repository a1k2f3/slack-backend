import express from 'express';
// import { sendMessage, getChatHistory } from '../controllers/chatController.mjs';
import { sendMessage, getChatHistory,createGroup } from './controller.js'; // Adjust the import path as necessary

const router = express.Router();
import multer from "multer";
import fs from "fs";
import path from "path";
router.use(express.static("chat"));
const imagesDir = path.join("group", "files");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'group/'); // folder to save files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, Word docs, and text files are allowed!'));
  }
};
const upload = multer({ storage:storage,
fileFilter: fileFilter, 
});
// POST: Send a message
router.post('/sendgroup',upload.array("file"),sendMessage);
router.post('/creategroup',upload.single("groupimage"),createGroup);
// GET: Fetch chat history
router.get('/readchat', getChatHistory);

export default router;
