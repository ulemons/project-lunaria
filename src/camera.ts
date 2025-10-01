// src/camera.ts

import fs from 'fs';
import path from 'path';
import { exec as rawExec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const PHOTOS_DIR = path.resolve('./photos');

export function ensurePhotosDir(): void {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    console.log(`[i] Created photos directory at ${PHOTOS_DIR}`);
  }
}

const exec = promisify(rawExec);

const MIN_LUX_THRESHOLD = 3;

async function getCurrentLux(): Promise<number | null> {
  const tempPath = path.join(os.tmpdir(), `lunaria-meta-${Date.now()}.json`);
  const cmd = `rpicam-still -t 500 --metadata ${tempPath} -o /dev/null --nopreview`;

  try {
    await exec(cmd);
    const raw = fs.readFileSync(tempPath, 'utf-8');
    const metadata = JSON.parse(raw);
    fs.unlinkSync(tempPath);
    return metadata.Lux ?? null;
  } catch (err) {
    console.error(`[!] Failed to read Lux:`, err);
    return null;
  }
}

export async function takePhoto(): Promise<void> {
  const lux = await getCurrentLux();

  if (lux === null) {
    console.log('[!] Could not determine light level. Skipping photo.');
    return;
  }

  if (lux < MIN_LUX_THRESHOLD) {
    console.log(`[🌙] Too dark to take photo (Lux: ${lux}). Skipping.`);
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `photo-${timestamp}.jpg`;
  const filepath = path.join(PHOTOS_DIR, filename);
  const cmd = `rpicam-still -o ${filepath} --nopreview -t 1000`;

  try {
    await exec(cmd);
    console.log(`[+] Photo taken: ${filename} (Lux: ${lux})`);
  } catch (err) {
    console.error(`[!] Error taking photo: ${err}`);
  }
}

