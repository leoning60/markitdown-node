/**
 * Abstract base class for document backends
 */

import { Document, InputFormat, BackendOptions } from '../types';

export abstract class AbstractBackend {
  protected options: BackendOptions;

  constructor(options: BackendOptions = {}) {
    this.options = {
      extractImages: true,
      extractTables: true,
      extractFormatting: true,
      ...options,
    };
  }

  /**
   * Check if the backend can handle the given input format
   */
  abstract supportsFormat(format: InputFormat): boolean;

  /**
   * Convert the document from the source path or buffer
   */
  abstract convert(source: string | Buffer, filename?: string): Promise<Document>;

  /**
   * Validate if the source is valid for this backend
   */
  abstract isValid(source: string | Buffer): Promise<boolean>;
}

