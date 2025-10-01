#!/usr/bin/env node

// Will import uuid dynamically in the function
import readline from 'readline';
import path from 'path';
import { saveSeedConfig } from './config';
import { downloadPhotosFromSeed } from './download';
import { createTimelapse } from './timelapse';

const DOWNLOAD_DIR_DEFAULT = './photos';
const VIDEOS_DIR_DEFAULT = './videos';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function registerSeed(): Promise<void> {
  console.log('🌱 Registering a new Lunaria Seed...');

  // Dynamic import for ESM modules
  const { v4: uuidv4 } = await import('uuid');

  const name = await ask('Plant name (e.g., Kitchen Basil): ');
  const location = await ask('Location (e.g., Kitchen): ');
  const owner = await ask('Owner: ');
  const photosDir = './photos';
  const exposeApi = true;
  const port = 4269;

  const config = {
    seedId: `seed-${uuidv4().slice(0, 8)}`,
    name,
    location,
    owner,
    photosDir,
    exposeApi,
    port
  };

  saveSeedConfig(config);
  console.log(`✅ Seed registered with ID: ${config.seedId}`);
}

async function downloadCommand(): Promise<void> {
  console.log('📥 Download photos from a remote Lunaria Seed...');
  
  const seedUrl = await ask('Seed URL (e.g., http://192.168.1.100:4269): ');
  const overwriteAnswer = await ask('Overwrite existing files? (y/N): ');
  const overwrite = overwriteAnswer.toLowerCase() === 'y' || overwriteAnswer.toLowerCase() === 'yes';
  
  try {
    await downloadPhotosFromSeed({
      seedUrl: seedUrl.replace(/\/+$/, ''), // Remove trailing slashes
      downloadDir: path.resolve(DOWNLOAD_DIR_DEFAULT),
      overwrite
    });
  } catch (error) {
    console.error('❌ Download failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function timelapseCommand(): Promise<void> {
  console.log('🎬 Create timelapse video from photos...');
  console.log('📋 Note: This command requires FFmpeg to be installed on your system.');
  
  const fpsInput = await ask('Frames per second (default: 10): ') || '10';
  const qualityInput = await ask('Quality [low/medium/high] (default: medium): ') || 'medium';
  
  const fps = parseInt(fpsInput, 10) || 10;
  const quality = ['low', 'medium', 'high'].includes(qualityInput) ? qualityInput as 'low' | 'medium' | 'high' : 'medium';
  
  // Generate timestamp-based filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFilename = `timelapse-${timestamp}.mp4`;
  const outputPath = path.join(VIDEOS_DIR_DEFAULT, outputFilename);
  
  try {
    await createTimelapse({
      photosDir: path.resolve(DOWNLOAD_DIR_DEFAULT),
      outputPath: path.resolve(outputPath),
      fps,
      quality
    });
  } catch (error) {
    console.error('❌ Timelapse creation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function showHelp(): void {
  console.log(`
🌱 Lunaria CLI - Timelapse Plant Growth System

Usage:
  lunaria-cli [command] [options]

Commands:
  register                Register a new seed configuration
  download                Download photos from a remote seed
  timelapse               Create timelapse video from photos
  --register              Alias for register
  --download              Alias for download
  --timelapse             Alias for timelapse
  --help, -h              Show this help message
  --version, -v           Show version information

Examples:
  lunaria-cli register    # Interactive setup for new seed
  lunaria-cli download    # Download photos from remote seed
  lunaria-cli timelapse   # Create timestamped timelapse in ./videos/
  lunaria-cli --help      # Show this help
  lunaria-cli --timelapse # Create timelapse with -- prefix
  `);
}

function showVersion(): void {
  // Read version from package.json at runtime
  console.log('🌱 Lunaria CLI v0.1.0');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'register':
    case '--register':
      await registerSeed();
      break;
    case 'download':
    case '--download':
      await downloadCommand();
      break;
    case 'timelapse':
    case '--timelapse':
      await timelapseCommand();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      showVersion();
      break;
    default:
      if (!command) {
        showHelp();
      } else {
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "lunaria-cli --help" for available commands.');
        process.exit(1);
      }
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ CLI error:', error);
    process.exit(1);
  });
}