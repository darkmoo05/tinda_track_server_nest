/**
 * Abstraction over where product images are stored.
 *
 * The current implementation writes to local disk (`LocalStorageProvider`).
 * To switch to DigitalOcean Spaces (or any S3-compatible service), implement
 * this interface and swap the injection token in InventoryModule.
 */
export interface IStorageProvider {
  /**
   * Persist the uploaded file and return the public-accessible URL / path.
   *
   * @param file       - The Multer file object (already written to disk by
   *                     `diskStorage` when using `LocalStorageProvider`).
   * @param bucketPath - Logical path segment, e.g. `uploads/products`.
   * @returns A string that can be stored in `Product.imageUrl` and served
   *          back to clients (e.g. `/uploads/products/abc.webp`).
   */
  uploadFile(file: Express.Multer.File, bucketPath: string): Promise<string>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
