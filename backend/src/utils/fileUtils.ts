import fs from 'fs';
import path from 'path';
import { config } from '@config/app';
import { v4 as uuidv4 } from 'uuid';

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getUploadPath(subfolder: string = 'documents'): string {
  const uploadPath = path.join(config.upload.dir, subfolder);
  ensureDirectoryExists(uploadPath);
  return uploadPath;
}

export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  return `${uuidv4()}${ext}`;
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getTempDir(): string {
  const tempDir = path.join(config.upload.dir, 'temp');
  ensureDirectoryExists(tempDir);
  return tempDir;
}

export function cleanupTempFiles(maxAgeMinutes: number = 60): void {
  const tempDir = getTempDir();
  const files = fs.readdirSync(tempDir);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    const ageMinutes = (now - stats.mtimeMs) / (1000 * 60);

    if (ageMinutes > maxAgeMinutes) {
      deleteFile(filePath);
    }
  }
}