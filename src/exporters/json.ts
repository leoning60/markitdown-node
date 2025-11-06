/**
 * JSON Exporter - Export document to JSON format
 */

import { Document, DocumentItem } from '../types';

export interface JSONExportOptions {
  pretty?: boolean;
  indent?: number;
  includeMetadata?: boolean;
}

export class JSONExporter {
  /**
   * Export document to JSON string
   */
  static export(document: Document, options: JSONExportOptions = {}): string {
    const {
      pretty = true,
      indent = 2,
      includeMetadata = true,
    } = options;

    const output: any = {};

    if (includeMetadata) {
      output.metadata = document.metadata;
    }

    output.content = document.content;

    if (pretty) {
      return JSON.stringify(output, null, indent);
    }

    return JSON.stringify(output);
  }

  /**
   * Export document to JSON object
   */
  static exportToObject(document: Document, includeMetadata = true): any {
    const output: any = {};

    if (includeMetadata) {
      output.metadata = document.metadata;
    }

    output.content = document.content;

    return output;
  }

  /**
   * Export only content without metadata
   */
  static exportContent(document: Document): DocumentItem[] {
    return document.content;
  }

  /**
   * Export with custom transformation
   */
  static exportWithTransform(
    document: Document,
    transformer: (item: DocumentItem) => any
  ): any {
    return {
      metadata: document.metadata,
      content: document.content.map(transformer),
    };
  }
}

