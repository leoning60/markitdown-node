/**
 * Image Backend - Image handling with OCR support
 * Uses Tesseract.js for optical character recognition
 */

import * as fs from 'fs';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export class ImageBackend extends AbstractBackend {
  private ocrLanguages: string;

  constructor(options: BackendOptions = {}) {
    super(options);
    // Default to simplified Chinese + English for better international support
    this.ocrLanguages = options.ocrLanguages || 'chi_sim+eng';
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.IMAGE;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);

      // Check for PNG signature
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return true;
      }

      // Check for JPEG signature
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return true;
      }

      // Check for other image formats using sharp
      try {
        await sharp(buffer).metadata();
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Perform OCR with configured languages
    const worker = await createWorker(this.ocrLanguages, 1, {
      logger: () => { }, // Suppress logs
    });

    try {
      const { data } = await worker.recognize(buffer);

      const content: DocumentItem[] = [];

      // Extract text from OCR result
      const text = data.text.trim();

      if (text) {
        // Split into paragraphs (by double newlines or single newlines)
        const paragraphs = text
          .split(/\n\n+/)
          .map(p => p.trim())
          .filter(p => p.length > 0);

        for (const paragraph of paragraphs) {
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text: paragraph,
            metadata: {
              confidence: data.confidence,
              ocrLanguages: this.ocrLanguages,
            },
          });
        }
      }

      // If no text was extracted, add a note
      if (content.length === 0) {
        content.push({
          type: DocumentItemType.PARAGRAPH,
          text: '[No text detected in image]',
          metadata: {
            note: 'The image may not contain readable text, or the text may be too small/unclear',
          },
        });
      }

      await worker.terminate();

      return {
        metadata: {
          filename: filename || 'image',
          format: InputFormat.IMAGE,
          title: filename || 'Image Document',
          width: metadata.width,
          height: metadata.height,
          imageFormat: metadata.format,
          ocrLanguages: this.ocrLanguages,
        },
        content,
      };
    } catch (error) {
      await worker.terminate();
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

