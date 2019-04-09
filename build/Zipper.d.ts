import { IInputFile, ITailItem, IZip } from './types';
declare class Zipper {
    tail: ITailItem[];
    completedZip: IZip[];
    errorZip: IZip[];
    insert(zipName: string, files: IInputFile[]): string;
    getCompletedZip(token: string): IZip;
    status(token: string): any;
    setErrorZip(): void;
    downloadFiles(): Promise<any[]>;
    zipFiles(): Promise<{}>;
    compute(): void;
    trigger(): void;
}
export default Zipper;
