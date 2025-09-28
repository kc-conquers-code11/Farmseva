import formidable from "formidable";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // disable Next.js bodyParser so formidable can handle it
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in .env.local
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Upload error" });
      }

      const message = fields.message?.[0] || "";
      const lang = fields.lang?.[0] || "en-IN";

      // Handle image info if provided
      let imageInfo = null;
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        imageInfo = {
          name: file.originalFilename,
          size: file.size,
        };
      }

      // 🔹 Call OpenAI with the text message
      let reply = "";
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
        });
        reply = completion.choices[0].message.content;
      } catch (e) {
        console.error("OpenAI error:", e);
        return res.status(500).json({ error: "AI service error" });
      }

      // 🔹 Build the response
      res.status(200).json({
        reply,
        lang,
        image: imageInfo,
      });
    });
  } catch (e) {
    console.error("Handler error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
