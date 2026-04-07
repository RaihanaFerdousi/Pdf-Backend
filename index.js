import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const UPLOADS_DIR = path.resolve(__dirname, "uploads");
const CONVERTED_DIR = path.resolve(__dirname, "converted");
const APP_IMAGE_PATH = path.resolve(__dirname, "pdf2htmlEX.AppImage");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR, { recursive: true });

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(fileUpload());
app.use("/converted", express.static(CONVERTED_DIR));

app.post("/api/upload-pdf", (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send("No files were uploaded.");
  }

  const pdfFile = req.files.pdf;
  const safeFileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`;
  const uploadPath = path.join(UPLOADS_DIR, safeFileName);
  const outputName = safeFileName.replace(".pdf", ".html");

  pdfFile.mv(uploadPath, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).send(err);
    }

    const command = `"${APP_IMAGE_PATH}" --appimage-extract-and-run --outline 0 --dest-dir "${CONVERTED_DIR}" "${uploadPath}" "${outputName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec Error: ${error}`);
        console.error(`Stderr Detail: ${stderr}`);
        return res.status(500).json({ error: "Conversion failed", details: stderr });
      }
      
      const protocol = req.get('x-forwarded-proto') || req.protocol;
      const host = req.get('host');
      res.json({ htmlUrl: `${protocol}://${host}/converted/${outputName}` });
    });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});