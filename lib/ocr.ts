import { recognize } from 'tesseract.js';

const OCR_TIMEOUT_MS = 1900;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('OCR timed out')), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function cleanOcrText(value: string) {
  return value
    .replace(/[$¢]/g, ' ')
    .replace(/\b(?:lb|kg|each|ea|per|save|sale|fresh|organic)\b/gi, ' ')
    .replace(/[^a-z0-9.\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractTextFromImage(imageDataUrl: string): Promise<string> {
  const result = await withTimeout(
    recognize(imageDataUrl, 'eng', {
      logger: () => undefined
    }),
    OCR_TIMEOUT_MS
  );

  return cleanOcrText(result.data.text);
}
