import { IStorageProvider } from './storage-provider.interface.js';
export declare class LocalStorageProvider implements IStorageProvider {
    uploadFile(file: Express.Multer.File, bucketPath: string): Promise<string>;
}
