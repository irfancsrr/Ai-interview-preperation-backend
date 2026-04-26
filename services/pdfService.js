const fs = require('fs');
// const pdfParse = require("pdf-parse");
const { extractText } = require("unpdf");



const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const unit8=new Uint8Array(dataBuffer);
  const data = await extractText(unit8);
  return data.text;
};

module.exports = { extractTextFromPDF };
