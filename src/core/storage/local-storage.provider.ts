import { Injectable } from '@nestjs/common';
import { IStorageProvider } from './storage-provider.interface.js';

/**
 * Development-friendly storage provider that serves files directly from
 * the local disk via NestJS's `useStaticAssets` middleware.
 *
 * Migration path to DigitalOcean Spaces:
 *   1. Install `@aws-sdk/client-s3` (S3-compatible API).
 *   2. Implement `IStorageProvider` in a `SpacesStorageProvider`.
 *   3. Swap the class in `InventoryModule` providers.
 *   No other code needs to change.
 */
@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  /**
   * The file has already been written to `./uploads/products/` by Multer's
   * `diskStorage`. We simply derive the web-accessible path from the stored
   * filename and return it so it can be persisted on the Product record.
   */
  async uploadFile(file: Express.Multer.File, bucketPath: string): Promise<string> {
    // bucketPath is expected to be something like "uploads/products"
    return `/${bucketPath}/${file.filename}`;
  }
}
