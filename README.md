# 🌱 Project Lunaria

Project Lunaria is inspired by a plant that blooms quietly, drops its seeds, and returns each year. Like the plant, this open-source project grows, spreads, and thrives through the community.

A time-lapse camera system built for Raspberry Pi to capture the growth of your plants — fully open source, built with TypeScript + Node.js.

A small system that captures the beauty of time — one photo at a time. 🌙🌱

## Features

- ⏱️ **Time-lapse Photography**: Takes a photo every hour using Raspberry Pi camera
- 🗂️ **Local Storage**: Saves photos locally to `/photos` folder  
- 🌐 **Global CLI Tool**: Install `lunaria-cli` globally for remote seed management
- 📥 **Remote Photo Download**: Download photos from remote Lunaria seeds via API
- 🎬 **Timelapse Video Creation**: Generate MP4 timelapse videos with FFmpeg integration
- ⏰ **Timestamp Overlays**: Add date/time stamps to timelapse videos
- 🔧 **Interactive Setup**: Guided CLI prompts for seed registration and configuration  

## Installation

### 🔧 Camera Setup

Ensure `rpicam-still` is installed:

```bash
sudo apt update
sudo apt install libcamera-apps
```

### NodeJs Setup

Install `nodeJs` using `nvm`:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

restart the terminal, now you should be able to run:
```
nvm install node
```

### 🎬 FFmpeg Setup (for timelapse videos)

To create timelapse videos with `lunaria-cli timelapse`, you need FFmpeg installed on your system:

#### macOS:
```bash
# Install Homebrew if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg:
brew install ffmpeg

# Verify installation:
ffmpeg -version
```

#### Ubuntu/Debian:
```bash
sudo apt update && sudo apt install ffmpeg
```

#### Windows:
```bash
# Using Chocolatey:
choco install ffmpeg

# Or download manually from: https://ffmpeg.org/download.html
```

> **Note:** FFmpeg is a system dependency and cannot be installed via npm. It must be installed separately on your operating system.

### Run The project

Now it is time to clone the repository:

Clone the project:
```bash
git clone https://github.com/ulemons/project-lunaria.git
cd project-lunaria
```

📦 Build and install the project:
```bash
npm install
npm run build
npm install -g .
```

### 🚀 Development Workflow

For faster development iterations, use these convenient scripts:

```bash
# Build and install globally in one command
npm run dev

# Force reinstall (useful when making changes)
npm run update-cli
```

## 🛠️ Using Lunaria CLI

Once installed globally, you can use the `lunaria-cli` command from anywhere on your system.

### Available Commands

```bash
# Show help and available commands
lunaria-cli --help

# Register a new seed configuration
lunaria-cli register

# Download photos from a remote seed
lunaria-cli download

# Create timelapse videos from photos
lunaria-cli timelapse

# Show version information
lunaria-cli --version
```

### Setting up a new seed

Configure your Lunaria seed interactively:

```bash
lunaria-cli register
```

This will prompt you for:
- **Plant name** (e.g., "Kitchen Basil")
- **Location** (e.g., "Kitchen")  
- **Owner name**

The configuration is saved as `config.json` in your project directory.

#### Example Workflow

```bash
# 1. Set up a new plant monitoring seed
lunaria-cli register

# 2. Start the camera system locally
npm start

# 3. Download photos from another seed
lunaria-cli download

# 4. Create a beautiful timelapse video
lunaria-cli timelapse
```

### Downloading photos from remote seeds

Download all photos from a remote Lunaria seed:

```bash
lunaria-cli download
```

You'll be prompted to enter:
- **Seed URL**: The remote seed's API endpoint (e.g., `http://192.168.1.100:4269`)
- **Download directory**: Local folder to save photos (default: `./photos`)
- **Overwrite existing files**: Whether to overwrite files that already exist

The CLI will:
1. Connect to the remote seed's API
2. Retrieve the list of available photos
3. Download each photo with progress indication
4. Show a summary of downloaded vs skipped files

### Creating timelapse videos

Create a timelapse video from your photos:

```bash
lunaria-cli timelapse
```

**Prerequisites:** FFmpeg must be installed (see FFmpeg Setup section above)

You'll be prompted to configure:
- **Photos directory**: Source folder with photos (default: `./photos`)
- **Frame rate**: Frames per second for the video (default: 10 fps)
- **Quality**: Video quality level - low/medium/high (default: medium)
- **Timestamps**: Whether to overlay date/time on the video (default: yes)

The timelapse will be saved as `./videos/timelapse-TIMESTAMP.mp4` with an automatic timestamp-based filename.

**Quality Settings:**
- **Low**: 720p resolution, faster encoding
- **Medium**: 1080p resolution, balanced quality/speed (recommended)
- **High**: 1440p resolution, best quality but slower encoding

### Starting the camera system

▶️ Start the time-lapse system manually:
```bash
npm start
```

## Autostart with systemd

To run automatically Lunaria on system boot (es. Raspberry Pi, Linux server), follow these steps:

### 1. Find complete paths of Node.js and project Lunaria

Open terminal and run:

```bash
which node
which npm
```

Write down the paths (es. `/usr/bin/node`, `/usr/local/bin/npm`).

Find the project path, for example:

```bash
/home/ubuntu/project-lunaria
```

### 2. Create new systemd service file

Open the service file:

```bash
sudo nano /etc/systemd/system/lunaria.service
```

Paste the following text (edit `WorkingDirectory`, `ExecStart`, `User` e `PATH` if needed):

```ini
[Unit]
Description=Automatic start of project Lunaria
After=network.target

[Service]
ExecStart=/usr/local/bin/npm run start
WorkingDirectory=/home/ubuntu/project-lunaria
Restart=always
User=ubuntu
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

> **Note**: replace `ubuntu` with your username (retrieved with `whoami`).

### 3. Enable and start the service

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable lunaria.service
sudo systemctl start lunaria.service
```

### 4. Check that is runnning

Check service state:

```bash
sudo systemctl status lunaria.service
```

Monitor live logs:

```bash
journalctl -u lunaria.service -f
```

## 🔍 Troubleshooting

### Common Issues

**FFmpeg not found when creating timelapse:**
```bash
# Verify FFmpeg installation
ffmpeg -version

# If not installed, install via package manager:
# macOS: brew install ffmpeg
# Ubuntu/Debian: sudo apt install ffmpeg
```

**CLI command not found after global installation:**
```bash
# Reinstall globally
npm run update-cli

# Or manually:
npm uninstall -g project-lunaria
npm install -g .
```

**Permission errors on Raspberry Pi:**
```bash
# Ensure camera permissions
sudo usermod -a -G video $USER
# Logout and login again
```

**Module import errors:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### FAQ

**Q: Can I use a different frame rate for timelapses?**
A: Yes! The CLI prompts for frame rate (default: 10 fps). Higher values create smoother but larger videos.

**Q: Where are timelapse videos saved?**
A: Videos are saved in `./videos/` directory with automatic timestamp-based filenames.

**Q: Can I disable timestamp overlays?**
A: Yes, the CLI will ask if you want timestamps. Choose "no" for clean videos without overlays.

**Q: What photo formats are supported?**
A: The system works with JPEG photos (standard Raspberry Pi camera output).

## 🔧 Technical Stack

- **Runtime**: Node.js with TypeScript (ES2020)
- **Core Dependencies**: 
  - Express 5.1.0 (Web API framework)
  - Cron 4.3.3 (Scheduled photography)
  - UUID 13.0.0 (Unique identifiers)
- **Video Processing**: FFmpeg (external dependency)
- **Module System**: CommonJS (for maximum compatibility)
- **CLI Framework**: Native Node.js readline for interactive prompts
- **HTTP Client**: Native Node.js http/https modules (no external dependencies)

## 🧪 Compatibility

| Device                  | OS | Status     | Note |
|-------------------------|----|------------|------|
| Raspberry Pi Zero W 1.1 |    |      ❌    |Currently unsupported due to hardware limitations.      |
| Raspberry Pi 3/4        | Linux | ✅ | Recommended platform |
| macOS                   | macOS | ✅ | Development and CLI usage |
| Ubuntu/Debian          | Linux | ✅ | Full compatibility |

## Roadmap

### CLI Development
- ✅ Global CLI installation with `lunaria-cli` command
- ✅ Remote photo downloading from seed APIs
- ✅ Interactive seed registration
- ✅ Timelapse video creation with FFmpeg integration
- ✅ Timestamp overlays on videos
- ✅ Development workflow optimization
- 🔄 Auto-discovery of seeds in local network
- 🔄 Bulk operations for multiple seeds
- 🔄 Video export with custom date ranges
- 🔄 Multiple video formats support (GIF, WebM)

### Seed Development
1. Seed Discovery: automatic detection of seeds in your network
2. Seed Configuration: API-based configuration management with profile pictures
3. LLM integration to assess plant health from photos
4. Weather data integration
5. API endpoints for downloading photos within date ranges
6. Automated service configuration and setup
7. Bluetooth-based WiFi credential updates

### App Development
1. Cross-platform desktop app (Electron)
2. Mobile companion app
3. Web dashboard for seed management

## License

This project is licensed under the **MIT License**.  
© 2025 Umberto Sgueglia (ulemons). See [LICENSE](./LICENSE) for details.