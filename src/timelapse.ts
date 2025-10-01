// src/timelapse.ts
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TimelapseConfig {
  photosDir: string;
  outputPath: string;
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
}

export async function createTimelapse(config: TimelapseConfig): Promise<void> {
  try {
    console.log('[🎬] Starting timelapse creation...');
    
    // 1. Ensure output directory exists
    ensureOutputDir(config.outputPath);
    
    // 2. Validate ffmpeg installation
    await validateFFmpeg();
    
    // 3. Get and sort photo files
    const photoFiles = await getPhotoFiles(config.photosDir);
    if (photoFiles.length === 0) {
      throw new Error('No photos found in the specified directory');
    }
    
    console.log(`[📷] Found ${photoFiles.length} photos`);
    
    // 4. Create video with ffmpeg
    await generateVideo(config, photoFiles);
    
    console.log(`[🎉] Timelapse created successfully: ${config.outputPath}`);
    
  } catch (error) {
    console.error('[❌] Timelapse creation failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

function ensureOutputDir(outputPath: string): void {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`[📁] Created output directory: ${outputDir}`);
  }
}

async function validateFFmpeg(): Promise<void> {
  try {
    await execAsync('ffmpeg -version');
    console.log('[✅] FFmpeg found');
  } catch (error) {
    const installInstructions = getFFmpegInstallInstructions();
    throw new Error(`FFmpeg not found. Please install FFmpeg first:\n\n${installInstructions}\n\nFor more info: https://ffmpeg.org/download.html`);
  }
}

function getFFmpegInstallInstructions(): string {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin': // macOS
      return `📱 macOS:
  Using Homebrew (recommended):
    brew install ffmpeg
  
  Using MacPorts:
    sudo port install ffmpeg`;
    
    case 'linux':
      return `🐧 Linux:
  Ubuntu/Debian:
    sudo apt update && sudo apt install ffmpeg
  
  CentOS/RHEL/Fedora:
    sudo yum install ffmpeg  # or: sudo dnf install ffmpeg
  
  Arch Linux:
    sudo pacman -S ffmpeg`;
    
    case 'win32': // Windows
      return `🪟 Windows:
  Using Chocolatey (recommended):
    choco install ffmpeg
  
  Using Scoop:
    scoop install ffmpeg
  
  Manual download:
    1. Download from https://ffmpeg.org/download.html#build-windows
    2. Extract and add to PATH environment variable`;
    
    default:
      return `Please install FFmpeg for your system from: https://ffmpeg.org/download.html`;
  }
}

async function getPhotoFiles(photosDir: string): Promise<string[]> {
  if (!fs.existsSync(photosDir)) {
    throw new Error(`Photos directory not found: ${photosDir}`);
  }
  
  const files = fs.readdirSync(photosDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .sort(); // Sort alphabetically (assumes timestamp-based naming)
  
  return files.map(file => path.join(photosDir, file));
}

async function generateVideo(config: TimelapseConfig, photoFiles: string[]): Promise<void> {
  const fps = config.fps || 10;
  const quality = getQualitySettings(config.quality || 'medium');
  
  console.log('[🔧] Generating video with FFmpeg...');
  
  await generateVideoWithTimestamps(config, photoFiles, fps, quality);
}

async function generateVideoWithTimestamps(config: TimelapseConfig, photoFiles: string[], fps: number, quality: string): Promise<void> {
  console.log('[⚙️] Creating timelapse with dynamic timestamps...');
  
  // Create a temporary directory for processing individual frames with timestamps
  const tempDir = path.join(path.dirname(config.outputPath), 'temp_frames');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    console.log(`[📸] Processing ${photoFiles.length} photos with individual timestamps...`);
    
    // Process each photo to add its timestamp
    const processedFrames: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const frameNumber = String(i).padStart(6, '0');
      const outputFrame = path.join(tempDir, `frame_${frameNumber}.jpg`);
      
      // Extract date from this specific photo
      const photoDate = extractDateFromFilename(photoFile);
      const dateString = photoDate ? formatDateForVideo(photoDate) : `Photo ${i + 1}`;
      
      // Escape special characters for FFmpeg filter
      const escapedText = dateString.replace(/'/g, "'\\''").replace(/:/g, '\\:');
      
      // Create overlay with this photo's specific date
      const timestampFilter = `drawtext=text='${escapedText}':fontcolor=white:fontsize=64:x=40:y=h-60:box=1:boxcolor=black@0.8:boxborderw=10`;
      
      // Add timestamp to this specific frame
      const frameCommand = `ffmpeg -y -i "${photoFile}" -vf "${timestampFilter}" "${outputFrame}"`;
      
      await execAsync(frameCommand);
      processedFrames.push(outputFrame);
      
      // Show progress
      if ((i + 1) % 10 === 0 || i === photoFiles.length - 1) {
        console.log(`[�] Processed ${i + 1}/${photoFiles.length} frames...`);
      }
    }
    
    // Now create the video from processed frames
    console.log('[🎬] Creating final video from timestamped frames...');
    const framePattern = path.join(tempDir, 'frame_%06d.jpg');
    const videoCommand = `ffmpeg -y -r ${fps} -i "${framePattern}" ${quality} "${config.outputPath}"`;
    
    const { stdout, stderr } = await execAsync(videoCommand);
    
    if (stderr && !stderr.includes('frame=')) {
      console.warn('FFmpeg warnings:', stderr);
    }
    
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      console.log('[🧹] Cleaning up temporary files...');
      const tempFiles = fs.readdirSync(tempDir);
      for (const file of tempFiles) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    }
  }
}

function getQualitySettings(quality: 'low' | 'medium' | 'high'): string {
  switch (quality) {
    case 'low':
      return '-c:v libx264 -crf 28 -preset fast';
    case 'high':
      return '-c:v libx264 -crf 18 -preset slow';
    case 'medium':
    default:
      return '-c:v libx264 -crf 23 -preset medium';
  }
}

function generateTimestampFilter(photoFiles: string[]): string {
  // Use drawtext filter with dynamic timestamp from filename
  // This will show the actual timestamp extracted from each photo filename
  const timestampOverlay = "drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='Loading...':fontcolor=white:fontsize=28:x=20:y=h-50:box=1:boxcolor=black@0.7:boxborderw=8";
  
  return timestampOverlay;
}

// Helper function to extract date from filename (format: photo-2024-10-01T12-30-45-123Z.jpg)
export function extractDateFromFilename(filename: string): Date | null {
  const basename = path.basename(filename);
  // Match pattern: photo-2024-10-01T12-30-45-123Z.jpg
  const match = basename.match(/photo-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
  if (match) {
    // Convert back to ISO format: 2024-10-01T12:30:45.123Z
    const isoString = match[1].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, 'T$1:$2:$3.$4Z');
    return new Date(isoString);
  }
  return null;
}

// Format date for display in video
export function formatDateForVideo(date: Date): string {
  // Simple format to avoid FFmpeg parsing issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
}