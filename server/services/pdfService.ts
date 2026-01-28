import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const getPdfContent = async () => {
    const pdfDir = path.resolve(__dirname, "../knowledge_pdfs");
    const pdfFiles = [
        "OpEd - A Revolution at Our Feet.pdf",
        "Research Paper - Gravitational Reversal Physics.pdf",
        "White Paper - The Development of Localized Gravity Reversal Technology.pdf"
    ];

    const contents = await Promise.all(pdfFiles.map(async (fileName) => {
        const filePath = path.join(pdfDir, fileName);
        const text = await readPDF(filePath);
        return { fileName, text };
    }));

    return contents;
};