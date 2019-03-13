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
  WAITING,
  PROCESSING,
  ZIPPING,
  READY
}

export interface ITailItem {
  zipName: string;
  serverZipName: string;
  status: TailItemStatus;
  token: string;
  files: IFile[];
  error?: string;
}

export interface IZip {
  name: string;
  serverName: string;
  error?: string;
}
