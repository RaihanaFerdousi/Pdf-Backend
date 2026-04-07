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

const UPLOADS_DIR = "/tmp/uploads";
const CONVERTED_DIR = "/tmp/converted";

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR, { recursive: true });

app.use(cors());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use("/converted", express.static(CONVERTED_DIR));

app.post("/api/upload-pdf", (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send("No files were uploaded.");
  }

  const pdfFile = req.files.pdf;
  const safeFileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`;
  const uploadPath = path.join(UPLOADS_DIR, safeFileName);
  const outputName = safeFileName.replace(/\.[^/.]+$/, "") + ".html";

  pdfFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);

    const command = `pdf2htmlEX --outline 0 --dest-dir "${CONVERTED_DIR}" "${uploadPath}" "${outputName}"`;

    exec(command, (error, stdout, stderr) => {
      if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);

      if (error) {
        return res.status(500).json({ error: "Conversion failed", details: stderr });
      }

      const protocol = req.get('x-forwarded-proto') || req.protocol;
      const host = req.get('host');
      res.json({ htmlUrl: `${protocol}://${host}/converted/${outputName}` });
    });
  });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});
