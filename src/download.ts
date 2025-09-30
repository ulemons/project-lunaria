// src/download.ts
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { pipeline } from 'stream/promises';
import { DownloadConfig } from './config';

export interface PhotoApiResponse {
  seedId: string;
  name: string;
  location: string;
  owner: string;
}

// Simple fetch implementation using Node.js native modules
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function fetchStream(url: string): Promise<NodeJS.ReadableStream> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      resolve(res);
    }).on('error', reject);
  });
}

export async function downloadPhotosFromSeed(config: DownloadConfig): Promise<void> {
  try {
    console.log(`[🌐] Connecting to seed at ${config.seedUrl}...`);
    
    // 1. Get seed status and photo list
    const status = await getSeedStatus(config.seedUrl);
    console.log(`[📱] Connected to seed: ${status.name} (${status.seedId})`);
    console.log(`[📍] Location: ${status.location} | Owner: ${status.owner}`);
    
    const photoList = await getPhotoList(config.seedUrl);
    console.log(`[📷] Found ${photoList.length} photos to download`);
    
    if (photoList.length === 0) {
      console.log('[ℹ️] No photos available for download');
      return;
    }
    
    // 2. Ensure download directory exists
    ensureDownloadDir(config.downloadDir);
    
    // 3. Download each photo
    let downloaded = 0;
    let skipped = 0;
    
    for (const photoName of photoList) {
      const result = await downloadPhoto(config.seedUrl, photoName, config.downloadDir, config.overwrite);
      if (result) {
        downloaded++;
        console.log(`[✅] Downloaded: ${photoName} (${downloaded}/${photoList.length})`);
      } else {
        skipped++;
        console.log(`[⏭️] Skipped: ${photoName} (already exists)`);
      }
    }
    
    console.log(`[🎉] Download complete! Downloaded: ${downloaded}, Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('[❌] Download failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

async function getSeedStatus(seedUrl: string): Promise<PhotoApiResponse> {
  try {
    return await fetchJson(`${seedUrl}/status`) as PhotoApiResponse;
  } catch (error) {
    throw new Error(`Failed to get seed status: ${error instanceof Error ? error.message : error}`);
  }
}

async function getPhotoList(seedUrl: string): Promise<string[]> {
  try {
    return await fetchJson(`${seedUrl}/photos`) as string[];
  } catch (error) {
    throw new Error(`Failed to get photo list: ${error instanceof Error ? error.message : error}`);
  }
}

async function downloadPhoto(
  seedUrl: string, 
  photoName: string, 
  downloadDir: string, 
  overwrite?: boolean
): Promise<boolean> {
  const localPath = path.join(downloadDir, photoName);
  
  // Check if file already exists
  if (!overwrite && fs.existsSync(localPath)) {
    return false; // Skip if file exists and overwrite is false
  }
  
  try {
    const stream = await fetchStream(`${seedUrl}/photo/${photoName}`);
    await pipeline(stream, fs.createWriteStream(localPath));
    return true;
  } catch (error) {
    throw new Error(`Failed to download ${photoName}: ${error instanceof Error ? error.message : error}`);
  }
}

function ensureDownloadDir(downloadDir: string): void {
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
    console.log(`[📁] Created download directory at ${downloadDir}`);
  }
}