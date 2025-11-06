/**
 * Type declarations for optional unzipper dependency
 */

declare module 'unzipper' {
  export interface Entry {
    path: string;
    type: 'File' | 'Directory';
    buffer(): Promise<Buffer>;
  }
  
  export interface Directory {
    files: Entry[];
  }
  
  export const Open: {
    buffer(buf: Buffer): Promise<Directory>;
  };
}

