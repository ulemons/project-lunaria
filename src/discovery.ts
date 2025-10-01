// src/discovery.ts
import dgram from 'dgram';
import { SeedConfig } from './config';

const DISCOVERY_PORT = 4270;
const ANNOUNCE_INTERVAL = 30000; // Annuncia ogni 30 secondi

export interface SeedAnnouncement {
  seedId: string;
  name: string;
  location: string;
  owner: string;
  ip?: string;
  port: number;
  timestamp: number;
}

export class SeedDiscovery {
  private socket: dgram.Socket;
  private announceTimer?: NodeJS.Timeout;
  private config?: SeedConfig;

  constructor() {
    this.socket = dgram.createSocket('udp4');
    this.setupSocket();
  }

  private setupSocket(): void {
    this.socket.on('error', (err) => {
      console.error('[🔍] Discovery error:', err.message);
    });

    this.socket.bind(() => {
      this.socket.setBroadcast(true);
      console.log('[🔍] Discovery service initialized');
    });
  }

  public startAnnouncing(config: SeedConfig): void {
    this.config = config;
    
    // Primo annuncio immediato
    this.announce();
    
    // Annunci periodici
    this.announceTimer = setInterval(() => {
      this.announce();
    }, ANNOUNCE_INTERVAL);

    console.log(`[🔍] Started announcing seed: ${config.name}`);
  }

  public stopAnnouncing(): void {
    if (this.announceTimer) {
      clearInterval(this.announceTimer);
      this.announceTimer = undefined;
    }
  }

  private announce(): void {
    if (!this.config) return;

    const announcement: SeedAnnouncement = {
      seedId: this.config.seedId,
      name: this.config.name,
      location: this.config.location,
      owner: this.config.owner,
      port: this.config.port,
      timestamp: Date.now()
    };

    const message = JSON.stringify(announcement);
    const broadcastAddress = '255.255.255.255';

    this.socket.send(message, DISCOVERY_PORT, broadcastAddress, (err) => {
      if (err) {
        console.error('[🔍] Broadcast error:', err.message);
      }
    });
  }

  public close(): void {
    this.stopAnnouncing();
    this.socket.close();
  }
}

// Istanza globale per la discovery
export const seedDiscovery = new SeedDiscovery();