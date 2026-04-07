import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(fileUpload());

app.use("/converted", express.static(path.join(__dirname, "converted")));

app.post("/api/upload-pdf", (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send("No files were uploaded.");
  }

  const pdfFile = req.files.pdf;
  const uploadPath = path.join(__dirname, "uploads", pdfFile.name);
  const outputName = pdfFile.name.replace(".pdf", ".html");
  const outputPath = path.join(__dirname, "converted", outputName);

  pdfFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);

    const command = `./pdf2htmlEX.AppImage --outline 0 --dest-dir "./converted" "${uploadPath}" "${outputName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: "Conversion failed" });
      }
      res.json({ htmlUrl: `http://localhost:3001/converted/${outputName}` });
    });
  });
});

app.listen(3001, () => console.log("Backend listening on port 3001"));