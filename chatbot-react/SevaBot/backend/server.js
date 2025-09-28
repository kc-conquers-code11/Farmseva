import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // increased limit for large messages/images

// Multer setup
const upload = multer({ dest: "uploads/" });

// Gemini setup
const genAI = new GoogleGenerativeAI("AIzaSyBFcH_RUZxpPzCJOhlMgeMr7J_aGZF2kL8");

app.post("/chat", upload.single("image"), async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const selectedLang = req.body.lang || "en-IN"; // frontend sends this
    const imageFile = req.file;

    let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let promptParts;

    // Prepare language instruction for Gemini
    const langInstruction = `Please reply in the following language: ${selectedLang}.`;

    if (imageFile) {
      const imageData = fs.readFileSync(imageFile.path).toString("base64");
      promptParts = [
        { text: `${userMessage} ${langInstruction}` },
        { inlineData: { data: imageData, mimeType: imageFile.mimetype } },
      ];
      fs.unlinkSync(imageFile.path);
    } else {
      promptParts = [{ text: `${userMessage} ${langInstruction}` }];
    }

    const result = await model.generateContent(promptParts);
    const reply =
      result.response.candidates[0]?.content?.parts[0]?.text ||
      "I couldn't generate a reply.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
