# 🌱 Project Lunaria

Project Lunaria is inspired by a plant that blooms quietly, drops its seeds, and returns each year. Like the plant, this open-source project grows, spreads, and thrives through the community.

A time-lapse camera system built for Raspberry Pi to capture the growth of your plants, fully open source, built with TypeScript + Node.js.

A small system that captures the beauty of time, one photo at a time. 🌙🌱

## Features

- ⏱️ **Time-lapse Photography**: Takes a photo on configurable interval using Raspberry Pi camera
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

Install `Node.js` using `nvm`:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

restart the terminal, now you should be able to run:
```
nvm install node
```

### 🎬 FFmpeg Setup

To create timelapse videos with `lunaria-cli timelapse`, you need FFmpeg installed on your system:

#### macOS:
```bash
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

Once installed you can find available commands using:

```bash
# Show help and available commands
lunaria-cli --help
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


### Creating timelapse videos

<!-- TODO: this info should be in the lunaria-cli timelapse --help -->
**Quality Settings:**
- **Low**: 720p resolution, faster encoding
- **Medium**: 1080p resolution, balanced quality/speed (recommended)
- **High**: 1440p resolution, best quality but slower encoding


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

## 🔧 Technical Stack

- **Runtime**: Node.js with TypeScript (ES2020)
- **Core Dependencies**: 
  - Express 5.1.0 (Web API framework)
  - Cron 4.3.3 (Scheduled photography)
  - UUID 13.0.0 (Unique identifiers)
- **Video Processing**: FFmpeg (external dependency)

## 🧪 Compatibility

<!-- TODO: add tested os for raspi 4 -->
| Device                  | OS | Status     | Note |
|-------------------------|----|------------|------|
| Raspberry Pi Zero W 1.1 |    |      ❌    |Currently unsupported due to hardware limitations.      |
| Raspberry Pi Zero 2 W   |    |      ⚠️    |Working in progress      |
| Raspberry Pi 4          | Linux | ✅ | Recommended platform |

## License

This project is licensed under the **MIT License**.  
© 2025 Umberto Sgueglia (ulemons). See [LICENSE](./LICENSE) for details.