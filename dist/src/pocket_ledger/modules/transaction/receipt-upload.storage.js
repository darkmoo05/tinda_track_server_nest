"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptStorage = void 0;
exports.receiptFileFilter = receiptFileFilter;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const multer_1 = require("multer");
const receiptUploadDir = (0, node_path_1.join)(process.cwd(), 'uploads', 'receipts');
function ensureReceiptUploadDir() {
    if (!(0, node_fs_1.existsSync)(receiptUploadDir)) {
        (0, node_fs_1.mkdirSync)(receiptUploadDir, { recursive: true });
    }
}
exports.receiptStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, callback) => {
        ensureReceiptUploadDir();
        callback(null, receiptUploadDir);
    },
    filename: (_req, file, callback) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const originalExt = (0, node_path_1.extname)(file.originalname).toLowerCase();
        const extension = allowedExtensions.includes(originalExt) ? originalExt : '.jpg';
        callback(null, `${Date.now()}-${(0, node_crypto_1.randomUUID)()}${extension}`);
    },
});
function receiptFileFilter(_req, file, callback) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const isAllowed = allowedMimeTypes.includes(file.mimetype);
    callback(isAllowed ? null : new Error('Only JPEG, PNG, and WEBP images are supported for receipts'), isAllowed);
}
//# sourceMappingURL=receipt-upload.storage.js.map