import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIRECTORY = path.resolve(__dirname, "../knowledge_pdfs");
const KNOWLEDGE_PDFS = [
    "OpEd - A Revolution at Our Feet.pdf",
    "Research Paper - Gravitational Reversal Physics.pdf",
    "White Paper - The Development of Localized Gravity Reversal Technology.pdf"
];

/**
 * Reads and parses a PDF file into text.
 */
export const readPDF = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        return result.text;
    } catch (error) {
        console.error(`Error reading PDF at ${filePath}:`, error);
        throw error;
    }
};

/**
 * Gets the content of all predefined knowledge PDFs.
 */
export const getPdfContent = async () => {
    const contents = await Promise.all(KNOWLEDGE_PDFS.map(async (fileName) => {
        const filePath = path.join(PDF_DIRECTORY, fileName);
        const text = await readPDF(filePath);
        return { fileName, text };
    }));

    return contents;
};