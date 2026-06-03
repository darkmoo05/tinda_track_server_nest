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
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const originalExt = extname(file.originalname).toLowerCase();
    const extension = allowedExtensions.includes(originalExt) ? originalExt : '.jpg';
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

export function receiptFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const isAllowed = allowedMimeTypes.includes(file.mimetype);
  callback(
    isAllowed ? null : new Error('Only JPEG, PNG, and WEBP images are supported for receipts'),
    isAllowed,
  );
}

