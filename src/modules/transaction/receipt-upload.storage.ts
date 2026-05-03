import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';

const receiptUploadDir = join(process.cwd(), 'uploads', 'receipts');

function ensureReceiptUploadDir(): void {
  if (!existsSync(receiptUploadDir)) {
    mkdirSync(receiptUploadDir, { recursive: true });
  }
}

export const receiptStorage = diskStorage({
  destination: (_req, _file, callback) => {
    ensureReceiptUploadDir();
    callback(null, receiptUploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname) || '.jpg';
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export function receiptFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  const isImage = file.mimetype.startsWith('image/');
  callback(isImage ? null : new Error('Only image uploads are supported for receipts'), isImage);
}
