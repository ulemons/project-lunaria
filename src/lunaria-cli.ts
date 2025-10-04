#!/usr/bin/env node

// Will import uuid dynamically in the function
import readline from 'readline';
import path from 'path';
import { saveSeedConfig } from './config';
import { downloadPhotosFromSeed } from './download';
import { createTimelapse } from './timelapse';
import { discoverSeeds, DiscoveredSeed } from './network-scanner';

const DOWNLOAD_DIR_DEFAULT = '/photos';
const VIDEOS_DIR_DEFAULT = '/videos';

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

async function selectSeedFromDiscovery(): Promise<string | null> {
  console.log('🔍 Discovering seeds on the network...\n');
  
  const seeds = await discoverSeeds();
  
  if (seeds.length === 0) {
    console.log('❌ No Lunaria seeds found on the network.');
    console.log('You can manually enter a seed URL, or make sure your seed is running.\n');
    
    const manualUrl = await ask('Enter seed URL manually (or press Enter to cancel): ');
    return manualUrl.trim() || null;
  }
  
  if (seeds.length === 1) {
    const seed = seeds[0];
    const useDiscovered = await ask(`Found 1 seed: "${seed.name}" at ${seed.ip}:${seed.port}. Use this? (Y/n): `);
    
    if (useDiscovered.toLowerCase() === 'n' || useDiscovered.toLowerCase() === 'no') {
      const manualUrl = await ask('Enter seed URL manually: ');
      return manualUrl.trim() || null;
    }
    
    return `http://${seed.ip}:${seed.port}`;
  }
  
  // Multiple seeds found - show selection menu
  console.log(`✅ Found ${seeds.length} seeds:\n`);
  
  seeds.forEach((seed, index) => {
    console.log(`${index + 1}. 🌱 ${seed.name}`);
    console.log(`   Location: ${seed.location} | Owner: ${seed.owner}`);
    console.log(`   URL: http://${seed.ip}:${seed.port}`);
    console.log('');
  });
  
  console.log(`${seeds.length + 1}. ✏️  Enter URL manually`);
  console.log(`${seeds.length + 2}. ❌ Cancel\n`);
  
  const choice = await ask(`Select seed (1-${seeds.length + 2}): `);
  const choiceNum = parseInt(choice, 10);
  
  if (choiceNum >= 1 && choiceNum <= seeds.length) {
    const selectedSeed = seeds[choiceNum - 1];
    return `http://${selectedSeed.ip}:${selectedSeed.port}`;
  } else if (choiceNum === seeds.length + 1) {
    const manualUrl = await ask('Enter seed URL: ');
    return manualUrl.trim() || null;
  } else {
    console.log('Operation cancelled.');
    return null;
  }
}

async function registerSeed(): Promise<void> {
  console.log('🌱 Registering a new Lunaria Seed...');

  // Generate simple random ID without external dependencies
  const randomId = Math.random().toString(36).substring(2, 10);

  const name = await ask('Plant name (e.g., Kitchen Basil): ');
  const location = await ask('Location (e.g., Kitchen): ');
  const owner = await ask('Owner: ');
  
  // Ask for camera rotation
  console.log('\n📷 Camera orientation setup:');
  console.log('   0° - Normal (camera upright)');
  console.log('  90° - Rotated 90° clockwise');
  console.log(' 180° - Upside down');
  console.log(' 270° - Rotated 90° counter-clockwise');
  
  const rotationInput = await ask('Camera rotation in degrees (0, 90, 180, 270) [default: 0]: ') || '0';
  const rotation = parseInt(rotationInput, 10);
  
  if (![0, 90, 180, 270].includes(rotation)) {
    console.log('❌ Invalid rotation. Using 0° (no rotation)');
  }
  
  const validRotation = [0, 90, 180, 270].includes(rotation) ? rotation as 0 | 90 | 180 | 270 : undefined;
  
  const photosDir = `${__dirname}/..${DOWNLOAD_DIR_DEFAULT}`;
  const exposeApi = true;
  const port = 4269;

  const config = {
    seedId: `seed-${randomId}`,
    name,
    location,
    owner,
    photosDir,
    exposeApi,
    port,
    ...(validRotation && { rotation: validRotation })
  };

  saveSeedConfig(config);
  console.log(`✅ Seed registered with ID: ${config.seedId}`);
  if (validRotation) {
    console.log(`📷 Camera rotation set to: ${validRotation}°`);
  }
}

async function downloadCommand(): Promise<void> {
  console.log('📥 Download photos from a remote Lunaria Seed...\n');
  
  // Automatic seed discovery and selection
  const seedUrl = await selectSeedFromDiscovery();
  
  if (!seedUrl) {
    console.log('❌ No seed selected. Download cancelled.');
    return;
  }
  
  console.log(`\n📡 Selected seed: ${seedUrl}`);
  
  const overwriteAnswer = await ask('Overwrite existing files? (y/N): ');
  const overwrite = overwriteAnswer.toLowerCase() === 'y' || overwriteAnswer.toLowerCase() === 'yes';
  
  try {
    const downloadDir = path.resolve(`${__dirname}/..${DOWNLOAD_DIR_DEFAULT}`);

    await downloadPhotosFromSeed({
      seedUrl: seedUrl.replace(/\/+$/, ''), // Remove trailing slashes
      downloadDir,
      overwrite
    });
  } catch (error) {
    console.error('❌ Download failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function timelapseCommand(): Promise<void> {
  console.log('🎬 Create timelapse video from photos...');
  console.log('📋 Note: This command requires FFmpeg to be installed on your system.\n');
  
  // Ask if user wants to download from a remote seed or use local photos
  const sourceChoice = await ask('Photo source - (1) Download from remote seed, (2) Use local photos: ');
  
  let downloadDir = path.resolve(`${__dirname}/..${DOWNLOAD_DIR_DEFAULT}`);
  
  if (sourceChoice === '1') {
    console.log('\n📥 First, let\'s download photos from a seed...\n');
    
    // Automatic seed discovery and selection
    const seedUrl = await selectSeedFromDiscovery();
    
    if (!seedUrl) {
      console.log('❌ No seed selected. Timelapse cancelled.');
      return;
    }
    
    console.log(`\n📡 Selected seed: ${seedUrl}`);
    
    const overwriteAnswer = await ask('Overwrite existing photos? (y/N): ');
    const overwrite = overwriteAnswer.toLowerCase() === 'y' || overwriteAnswer.toLowerCase() === 'yes';
    
    try {
      await downloadPhotosFromSeed({
        seedUrl: seedUrl.replace(/\/+$/, ''),
        downloadDir,
        overwrite
      });
      console.log('\n✅ Photos downloaded successfully!\n');
    } catch (error) {
      console.error('❌ Download failed:', error instanceof Error ? error.message : error);
      console.log('❌ Cannot proceed with timelapse without photos.');
      process.exit(1);
    }
  } else if (sourceChoice === '2') {
    const customDir = await ask(`Photos directory (default: ${DOWNLOAD_DIR_DEFAULT}): `);
    if (customDir.trim()) {
      downloadDir = path.resolve(customDir.trim());
    }
    console.log(`\n📂 Using photos from: ${downloadDir}\n`);
  } else {
    console.log('❌ Invalid choice. Timelapse cancelled.');
    return;
  }
  
  // Configure timelapse settings
  const fpsInput = await ask('Frames per second (default: 10): ') || '10';
  const qualityInput = await ask('Quality [low/medium/high] (default: medium): ') || 'medium';
  
  const fps = parseInt(fpsInput, 10) || 10;
  const quality = ['low', 'medium', 'high'].includes(qualityInput) ? qualityInput as 'low' | 'medium' | 'high' : 'medium';
  
  // Generate timestamp-based filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFilename = `timelapse-${timestamp}.mp4`;
  const outputPath = path.join(`${__dirname}/..${VIDEOS_DIR_DEFAULT}`, outputFilename);
  
  console.log('\n🎬 Creating timelapse video...\n');
  
  try {
    await createTimelapse({
      photosDir: downloadDir,
      outputPath: path.resolve(outputPath),
      fps,
      quality
    });
  } catch (error) {
    console.error('❌ Timelapse creation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function discoverCommand(): Promise<void> {
  console.log('🔍 Searching for Lunaria seeds on the network...');
  
  try {
    const seeds = await discoverSeeds(8000);
    
    if (seeds.length === 0) {
      console.log('\n❌ No Lunaria seeds found.');
      console.log('Make sure your seed is running and on the same network.');
    } else {
      console.log(`\n✅ Found ${seeds.length} seed(s):\n`);
      
      seeds.forEach((seed, index) => {
        console.log(`${index + 1}. 🌱 ${seed.name}`);
        console.log(`   Location: ${seed.location}`);
        console.log(`   Owner: ${seed.owner}`);
        console.log(`   IP: ${seed.ip}:${seed.port}`);
        console.log(`   API URL: http://${seed.ip}:${seed.port}`);
        console.log(`   Seed ID: ${seed.seedId}`);
        console.log(`   Last seen: ${seed.lastSeen.toLocaleTimeString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Discovery failed:', error instanceof Error ? error.message : error);
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
  discover                Find Lunaria seeds on the network
  --register              Alias for register
  --download              Alias for download
  --timelapse             Alias for timelapse
  --discover              Alias for discover
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

async function showVersion(): Promise<void> {
  try {
    const packageJson = await import('../package.json');
    console.log(`🌱 Lunaria CLI v${packageJson.version}`);
  } catch (error) {
    console.log('🌱 Lunaria CLI (version unavailable)');
  }
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
    case 'discover':
    case '--discover':
      await discoverCommand();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      await showVersion();
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