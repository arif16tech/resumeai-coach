import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

export const extractTextFromPDF = async (buffer) => {
  try {
    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    const text = result.text?.trim() || '';

    if (text.length < 50) {
      throw new Error(
        'PDF appears to be empty or image-based (no extractable text found).'
      );
    }

    await parser.destroy?.();

    return text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};