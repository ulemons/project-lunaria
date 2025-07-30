// src/camera.ts

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const PHOTOS_DIR = path.resolve('./photos');

export function ensurePhotosDir(): void {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    console.log(`[i] Created photos directory at ${PHOTOS_DIR}`);
  }
}

export function takePhoto(): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `photo-${timestamp}.jpg`;
  const filepath = path.join(PHOTOS_DIR, filename);

  const command = `libcamera-still -o ${filepath} --nopreview -t 1000`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`[!] Error taking photo: ${error.message}`);
    } else {
      console.log(`[+] Photo taken: ${filename}`);
    }
  });
}
