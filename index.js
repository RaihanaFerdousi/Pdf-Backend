import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(fileUpload({ createParentPath: true }));

const UPLOADS_DIR = path.join(__dirname, "uploads");
const CONVERTED_DIR = path.join(__dirname, "converted");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR);

app.use("/converted", express.static(CONVERTED_DIR));

app.post("/api/upload-pdf", (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const pdfFile = req.files.pdf;
  const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`;
  const inputPath = path.join(UPLOADS_DIR, fileName);
  const outputFileName = fileName.replace(".pdf", ".html");

  pdfFile.mv(inputPath, (err) => {
    if (err) return res.status(500).json({ error: err });

    const command = `./pdf2htmlEX.AppImage --no-sandbox --dest-dir "${CONVERTED_DIR}" --embed-css 1 --embed-font 1 "${inputPath}" "${outputFileName}"`;

    console.log("Converting...");
    exec(command, (error) => {
      if (error) {
        console.error("Conversion Error:", error);
        return res.status(500).json({ error: "Conversion failed" });
      }

      res.json({ 
        htmlUrl: `http://localhost:${PORT}/converted/${outputFileName}` 
      });
    });
  });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));