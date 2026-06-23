import { recognize } from 'tesseract.js';

export async function extractTextFromImage(imageDataUrl: string): Promise<string> {
  const result = await recognize(imageDataUrl, 'eng', {
    logger: () => undefined
  });
  return result.data.text.replace(/\s+/g, ' ').trim();
}
