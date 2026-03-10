const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function parseResume(file) {
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer
    });
    return result.value;
  }
  throw new Error("Unsupported file type");
}

module.exports = parseResume;
