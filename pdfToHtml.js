import pdf2html from "pdf2html";

export function pdfToHtml(pdfPath, htmlPath) {
  return new Promise((resolve, reject) => {
    pdf2html.html(pdfPath, htmlPath, (err, success) => {
      if (err) return reject(err);
      resolve(success);
    });
  });
}