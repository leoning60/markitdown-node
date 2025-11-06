/**
 * PlainText Backend - Converts plain text files, CSV, and JSON to structured format
 */

import * as fs from 'fs';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';

export class PlainTextBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return [
      InputFormat.CSV,
      InputFormat.JSON,
      InputFormat.TEXT,
    ].includes(format);
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      // Try to read as text
      const buffer = Buffer.isBuffer(source)
        ? source
        : await fs.promises.readFile(source);

      // Check if it's valid UTF-8 text
      const text = buffer.toString('utf-8');
      return text.length > 0;
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const buffer = Buffer.isBuffer(source)
      ? source
      : await fs.promises.readFile(source);

    const text = buffer.toString('utf-8');
    const content: DocumentItem[] = [];

    // Detect format from filename or content
    const ext = filename ? this.getExtension(filename) : '';
    let format: InputFormat;

    if (ext === '.csv') {
      format = InputFormat.CSV;
      this.parseCSV(text, content);
    } else if (ext === '.json') {
      format = InputFormat.JSON;
      this.parseJSON(text, content);
    } else {
      format = InputFormat.TEXT;
      this.parsePlainText(text, content);
    }

    return {
      metadata: {
        filename: filename || 'document.txt',
        format,
        title: filename || 'Untitled Document',
      },
      content,
    };
  }

  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }

  private parsePlainText(text: string, content: DocumentItem[]): void {
    // Split by paragraphs (double newlines)
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

    for (const paragraph of paragraphs) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: paragraph.trim(),
      });
    }

    // If no paragraphs found, treat as single block
    if (content.length === 0 && text.trim()) {
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: text.trim(),
      });
    }
  }

  private parseCSV(text: string, content: DocumentItem[]): void {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length === 0) return;

    // Parse CSV (simple implementation, handles quoted fields)
    const rows: string[][] = [];
    for (const line of lines) {
      const cells: string[] = [];
      let currentCell = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      rows.push(cells);
    }

    if (rows.length === 0) return;

    // Convert to table structure
    const numCols = Math.max(...rows.map((row) => row.length));
    const tableRows: any[][] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const tableRow: any[] = [];

      for (let j = 0; j < numCols; j++) {
        tableRow.push({
          text: row[j] || '',
          isHeader: i === 0, // First row as header
        });
      }

      tableRows.push(tableRow);
    }

    content.push({
      type: DocumentItemType.TABLE,
      rows: tableRows,
      numRows: tableRows.length,
      numCols,
    } as any);
  }

  private parseJSON(text: string, content: DocumentItem[]): void {
    try {
      const data = JSON.parse(text);

      // Add formatted JSON as code block
      content.push({
        type: DocumentItemType.CODE,
        text: JSON.stringify(data, null, 2),
        metadata: {
          language: 'json',
        },
      });

      // Also add a readable representation
      this.parseJSONStructure(data, content);
    } catch (error) {
      // If not valid JSON, treat as plain text
      content.push({
        type: DocumentItemType.PARAGRAPH,
        text: text,
      });
    }
  }

  private parseJSONStructure(data: any, content: DocumentItem[], level: number = 0): void {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item === 'object' && item !== null) {
          this.parseJSONStructure(item, content, level);
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // Extract meaningful text fields
      const textFields = ['title', 'name', 'description', 'text', 'content', 'body'];

      for (const field of textFields) {
        if (data[field] && typeof data[field] === 'string') {
          content.push({
            type: DocumentItemType.PARAGRAPH,
            text: `**${field}**: ${data[field]}`,
          });
        }
      }
    }
  }
}

