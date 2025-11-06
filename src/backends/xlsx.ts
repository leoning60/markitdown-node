/**
 * XLSX Backend - Converts Microsoft Excel spreadsheets to structured format
 */

import * as ExcelJS from 'exceljs';
import {
  Document,
  DocumentItem,
  DocumentItemType,
  InputFormat,
  TableItem,
  BackendOptions,
} from '../types';
import { AbstractBackend } from './base';
import * as fs from 'fs';

export class XLSXBackend extends AbstractBackend {
  constructor(options: BackendOptions = {}) {
    super(options);
  }

  supportsFormat(format: InputFormat): boolean {
    return format === InputFormat.XLSX;
  }

  async isValid(source: string | Buffer): Promise<boolean> {
    try {
      const buffer = Buffer.isBuffer(source) ? source : await fs.promises.readFile(source);
      // Check for XLSX file signature (PK header)
      return buffer[0] === 0x50 && buffer[1] === 0x4b;
    } catch {
      return false;
    }
  }

  async convert(source: string | Buffer, filename?: string): Promise<Document> {
    const workbook = new ExcelJS.Workbook();

    if (Buffer.isBuffer(source)) {
      await workbook.xlsx.load(source as any);
    } else {
      await workbook.xlsx.readFile(source);
    }

    const content: DocumentItem[] = [];

    // Process each worksheet
    workbook.eachSheet((worksheet, sheetId) => {
      // Add sheet title
      content.push({
        type: DocumentItemType.HEADING,
        text: worksheet.name,
        level: 1,
      });

      // Convert worksheet to table
      const rows: any[][] = [];

      worksheet.eachRow((row, rowNumber) => {
        const cells = row.values as any[];
        const rowData = cells.slice(1).map((cell) => ({
          text: this.formatCellValue(cell),
          isHeader: rowNumber === 1,
        }));
        rows.push(rowData);
      });

      if (rows.length > 0) {
        const tableItem: TableItem = {
          type: DocumentItemType.TABLE,
          rows,
          numRows: rows.length,
          numCols: rows[0]?.length || 0,
        };
        content.push(tableItem);
      }
    });

    return {
      metadata: {
        filename: filename || 'workbook.xlsx',
        format: InputFormat.XLSX,
        title: workbook.creator || filename || 'Untitled Workbook',
        author: workbook.creator,
      },
      content,
    };
  }

  private formatCellValue(cell: any): string {
    if (cell === null || cell === undefined) {
      return '';
    }

    if (typeof cell === 'object') {
      // Handle rich text
      if (cell.richText) {
        return cell.richText.map((rt: any) => rt.text).join('');
      }
      // Handle formula result
      if (cell.result !== undefined) {
        return String(cell.result);
      }
      // Handle hyperlinks
      if (cell.text) {
        return cell.text;
      }
      // Handle dates
      if (cell instanceof Date) {
        return cell.toISOString();
      }
    }

    return String(cell);
  }
}

