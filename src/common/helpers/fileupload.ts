import * as fs from 'fs';
import * as path from 'path';

/**
 * Saves an uploaded file to the local public directory.
 * @param file The Multer file object
 * @param subDirectory The destination folder inside /public
 * @returns The unique filename to be saved in the database
 */
export async function saveUploadedFile(
  file: Express.Multer.File,
  subDirectory: string,
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', subDirectory);
  
  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const timestamp = Date.now();
  
  // Extract extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Clean up the original filename
  const safeName = path.basename(file.originalname, ext)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();

  const fileName = `${timestamp}-${safeName}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  // Write the file in disk
  await fs.promises.writeFile(filePath, file.buffer);

  return fileName;
}