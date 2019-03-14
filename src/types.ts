import * as path from 'path';
import config from './config';
export interface IInputFile {
  filename: string;
  url: string;
}

export interface IFile {
  filename: string;
  serverFilename: string;
  url: string;
  error?: string;
  downloaded: boolean;
}

export enum TailItemStatus {
  WAITING = 'WAITING',
  PROCESSING = 'PROCESSING',
  ZIPPING = 'ZIPPING',
  READY = 'READY',
}

export interface ITailItem {
  token: string;
  zipName: string;
  serverZipName: string;
  status: TailItemStatus;
  files: IFile[];
  error?: string;
  size?: number;
}

export interface IZip {
  token: string;
  name: string;
  serverName: string;
  size?: number;
  error?: string;
}

export const tempFolder = path.join(__dirname,config.get('outputFolder'));
