import fs from 'fs';
import path from 'path';

export type SeedConfig = {
  seedId: string;
  name: string;
  location: string;
  owner: string;
  photosDir: string;
  exposeApi: boolean;
  port: number;
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
