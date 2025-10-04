import fs from 'fs';
import path from 'path';

export type IntervalType = 'CRON_5_MINUTES' | 'CRON_15_MINUTES' | 'CRON_30_MINUTES' | 'CRON_HOURLY';

export type SeedConfig = {
  seedId: string;
  name: string;
  location: string;
  owner: string;
  photosDir: string;
  exposeApi: boolean;
  port: number;
  rotation?: 0 | 90 | 180 | 270; // Rotation in degrees
  interval?: IntervalType; // Photo interval
};

export type DownloadConfig = {
  seedUrl: string;
  downloadDir: string;
  overwrite?: boolean;
};

const CONFIG_PATH = path.resolve('seed.json');

export function loadSeedConfig(): SeedConfig | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function saveSeedConfig(config: SeedConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getIntervalOptions(): { key: IntervalType; label: string; description: string }[] {
  return [
    { key: 'CRON_5_MINUTES', label: '5 minutes', description: 'Every 5 minutes' },
    { key: 'CRON_15_MINUTES', label: '15 minutes', description: 'Every 15 minutes' },
    { key: 'CRON_30_MINUTES', label: '30 minutes', description: 'Every 30 minutes' },
    { key: 'CRON_HOURLY', label: '1 hour', description: 'Every hour (default)' }
  ];
}

/**
 * Updates the photo interval for the local seed configuration.
 * 
 * IMPORTANT: This function only updates the LOCAL seed configuration file.
 * It cannot and should not be used to update remote seeds for security reasons.
 * To change intervals on remote seeds, access them directly via:
 * - SSH connection to the remote device
 * - Physical access to the device
 * - Direct console access on the seed device
 * 
 * @param newInterval - The new interval type to set
 * @returns true if the update was successful, false if no config exists
 */
export function updateSeedInterval(newInterval: IntervalType): boolean {
  const config = loadSeedConfig();
  if (!config) {
    return false;
  }
  
  config.interval = newInterval;
  saveSeedConfig(config);
  return true;
}
