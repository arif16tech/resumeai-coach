import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (buffer) => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.trim();
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};
