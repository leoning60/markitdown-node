/**
 * ZIP Backend - Extracts and converts files from ZIP archives
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export interface ZIPBackendOptions extends BackendOptions {
  // Parent converter instance for recursive processing
  parentConverter?: any;
}

export class ZIPBackend extends AbstractBackend {
  private parentConverter: any;

  constructor(options: ZIPBackendOptions = {}) {
    super(options);
    this.parentConverter = options.parentConverter;
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.ZIP;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      // Check for ZIP signature (PK\x03\x04)
      return buffer[0] === 0x50 && buffer[1] === 0x4b && 
             buffer[2] === 0x03 && buffer[3] === 0x04;
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    let unzipper: any;
    
    try {
      unzipper = await import('unzipper');
    } catch (error) {
      throw new Error(
        'Optional dependency "unzipper" is not installed. Run "npm install unzipper" to enable ZIP support.'
      );
    }

    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const zipFileName = filename || 'archive.zip';
    const content: DocumentItem[] = [];

    content.push({
      type: DocumentItemType.TITLE,
      text: `ZIP Archive: ${zipFileName}`,
      level: 1,
    });

    try {
      // Extract ZIP entries
      const directory = await unzipper.Open.buffer(buffer);
      
      for (const entry of directory.files) {
        if (entry.type === 'File') {
          const relativePath = entry.path;
          const entryBuffer = await entry.buffer();

          content.push({
            type: DocumentItemType.HEADING,
            text: `File: ${relativePath}`,
            level: 2,
          });

          // Try to convert the file using parent converter if available
          if (this.parentConverter) {
            try {
              const ext = path.extname(relativePath);
              const result = await this.parentConverter.convert(entryBuffer, relativePath);
              
              if (result.status === 'success' && result.document) {
                // Add the converted content
                content.push(...result.document.content);
              } else {
                // Failed to convert, show as raw content
                this.addRawFileContent(entryBuffer, ext, content);
              }
            } catch (error) {
              // Conversion failed, show error
              content.push({
                type: DocumentItemType.PARAGRAPH,
                text: `Error converting file: ${error instanceof Error ? error.message : String(error)}`,
              });
            }
          } else {
            // No parent converter, show basic info
            const ext = path.extname(relativePath);
            this.addRawFileContent(entryBuffer, ext, content);
          }
        }
      }
    } catch (error) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: `Error processing ZIP file: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return {
      metadata: {
        filename: zipFileName,
        format: InputFormat.ZIP,
        title: zipFileName,
      },
      content,
    };
  }

  private addRawFileContent(buffer: Buffer, ext: string, content: DocumentItem[]): void {
    // Check if it's a text-based file
    const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.html', '.css', '.js', '.ts'];
    
    if (textExtensions.includes(ext.toLowerCase())) {
      try {
        const text = buffer.toString('utf-8');
        if (text.length < 10000) {
          // Show full content for smaller files
          content.push({
            type: DocumentItemType.CODE,
            text: text,
            metadata: {
              language: ext.slice(1),
            },
          });
        } else {
          // Show truncated content for larger files
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text: `File is too large to display (${buffer.length} bytes). Showing first 1000 characters:`,
          });
          content.push({
            type: DocumentItemType.CODE,
            text: text.slice(0, 1000) + '\n\n... (truncated)',
            metadata: {
              language: ext.slice(1),
            },
          });
        }
      } catch (error) {
        content.push({
          type: DocumentItemType.PARAGRAPH,
          text: `Binary file (${buffer.length} bytes)`,
        });
      }
    } else {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: `Binary file (${buffer.length} bytes)`,
      });
    }
  }

  setParentConverter(converter: any): void {
    this.parentConverter = converter;
  }
}

