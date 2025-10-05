// src/network-scanner.ts
import dgram from 'dgram';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SeedAnnouncement } from './discovery';

const execAsync = promisify(exec);

export interface DiscoveredSeed extends SeedAnnouncement {
  lastSeen: Date;
}

async function getLocalNetwork(): Promise<string> {
  try {
    // Su macOS, otteniamo la rete locale dall'interfaccia di default
    const { stdout } = await execAsync('route -n get default | grep interface');
    const iface = stdout.trim().split(':')[1]?.trim();
    
    if (iface) {
      const { stdout: ifconfigOut } = await execAsync(`ifconfig ${iface} | grep 'inet '`);
      const match = ifconfigOut.match(/inet (\d+\.\d+\.\d+)\.\d+/);
      if (match) {
        return `${match[1]}.0/24`;
      }
    }
  } catch (error) {
    // Fallback per network comuni
  }
  
  // Fallback: proviamo reti comuni
  return '192.168.1.0/24';
}

async function scanNetworkForSeeds(): Promise<DiscoveredSeed[]> {
  console.log('[🔍] Scanning network for devices with Lunaria API...');
  
  const discoveries: DiscoveredSeed[] = [];
  const network = await getLocalNetwork();
  
  // Estrai la base IP dalla rete (es. 192.168.1 da 192.168.1.0/24)
  const baseIP = network.split('.').slice(0, 3).join('.');
  
  // Array di promesse per verificare ogni IP
  const promises: Promise<void>[] = [];
  
  for (let i = 1; i <= 254; i++) {
    const ip = `${baseIP}.${i}`;
    
    const promise = (async () => {
      try {
        // Usa curl con timeout breve per testare l'endpoint discovery
        const { stdout } = await execAsync(`curl -s --connect-timeout 1 --max-time 2 http://${ip}:4269/discovery 2>/dev/null`);
        
        if (stdout.trim() && stdout.startsWith('{')) {
          const seedInfo = JSON.parse(stdout);
          const seed: DiscoveredSeed = {
            ...seedInfo,
            ip,
            lastSeen: new Date()
          };
          discoveries.push(seed);
          console.log(`[�] Found seed: ${seedInfo.name} at ${ip}:${seedInfo.port}`);
        }
      } catch (error) {
        // IP non risponde o non ha Lunaria, ignora
      }
    })();
    
    promises.push(promise);
  }
  
  // Aspetta che tutte le verifiche finiscano
  await Promise.all(promises);
  
  return discoveries;
}

async function discoverViaUDP(timeoutMs: number = 3000): Promise<DiscoveredSeed[]> {
  return new Promise((resolve) => {
    const discoveries = new Map<string, DiscoveredSeed>();
    const socket = dgram.createSocket('udp4');

    socket.on('message', (msg, rinfo) => {
      try {
        const announcement: SeedAnnouncement = JSON.parse(msg.toString());
        const seed: DiscoveredSeed = {
          ...announcement,
          ip: rinfo.address,
          lastSeen: new Date()
        };
        
        discoveries.set(announcement.seedId, seed);
        console.log(`[📡] Found seed via UDP: ${announcement.name} at ${rinfo.address}:${announcement.port}`);
      } catch (error) {
        // Ignora messaggi non validi
      }
    });

    socket.on('error', (err) => {
      console.error('[❌] UDP Discovery error:', err.message);
      resolve([]);
    });

    socket.bind(4270, () => {
      console.log('[👂] Listening for UDP announcements...');
      
      setTimeout(() => {
        socket.close();
        const seeds = Array.from(discoveries.values());
        resolve(seeds);
      }, timeoutMs);
    });
  });
}

export async function discoverSeeds(timeoutMs: number = 5000): Promise<DiscoveredSeed[]> {
  console.log('[🔍] Scanning network for Lunaria seeds...');
  
  console.log('[1/2] Trying UDP discovery...');
  const udpSeeds = await discoverViaUDP(timeoutMs);
  
  if (udpSeeds.length > 0) {
    console.log(`[✅] UDP Discovery found ${udpSeeds.length} seed(s)`);
    return udpSeeds;
  }
  
  // Se UDP non funziona, scansiona la rete
  console.log('[2/2] UDP failed, scanning network manually...');
  const scannedSeeds = await scanNetworkForSeeds();
  
  console.log(`[✅] Network scan complete. Found ${scannedSeeds.length} seed(s)`);
  return scannedSeeds;
}