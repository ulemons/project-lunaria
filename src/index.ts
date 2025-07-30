// project-lunaria: Plant photo timelapse with Raspberry Pi (TypeScript)

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { CronJob } from 'cron';

const PHOTOS_DIR = path.resolve('./photos');

function takePhoto(): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `photo-${timestamp}.jpg`;
  const filepath = path.join(PHOTOS_DIR, filename);

  // For Raspberry Pi, use 'raspistill' or 'libcamera-still'
  const command = `libcamera-still -o ${filepath} --nopreview -t 1000`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`[!] Error taking photo: ${error.message}`);
    } else {
      console.log(`[+] Photo taken: ${filename}`);
    }
  });
}

function ensurePhotosDir(): void {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    console.log(`[i] Created photos directory at ${PHOTOS_DIR}`);
  }
}

export function startLunaria(): void {
  ensurePhotosDir();

  // Run every hour on the hour
  const job = new CronJob('0 0 * * * *', takePhoto, null, true, 'UTC');

  console.log('[🌱] Project Lunaria started. Taking photos every hour.');
}

// Start immediately if run directly
if (require.main === module) {
  startLunaria();
}
