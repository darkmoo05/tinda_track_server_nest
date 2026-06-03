export interface IStorageProvider {
    uploadFile(file: Express.Multer.File, bucketPath: string): Promise<string>;
}
export declare const STORAGE_PROVIDER: unique symbol;
