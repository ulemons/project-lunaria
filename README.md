# 🌱 Project Lunaria

A time-lapse camera system built for Raspberry Pi to capture the growth of your plants — fully open source, built with TypeScript + Node.js.

## Features

- ⏱️ Takes a photo every hour using Raspberry Pi camera  
- 🗂️ Saves photos locally to `/photos` folder  
- 📦 Ready to publish as an npm package  
- 🔁 Optionally install a system cron job for automatic scheduling  
- ⚠️ Warns user to install system dependencies manually  

## Installation

```bash
git clone https://github.com/your-username/project-lunaria.git
cd project-lunaria
npm install
```

📦 Build the project:
```bash
npm run build
```

▶️ Start it manually:
```bash
npm start
```

🛠️ Set up automatic cron job:
```bash
npm run setup
```

## 🔧 Camera Setup

Ensure `libcamera-still` is installed:

```bash
sudo apt update
sudo apt install libcamera-apps
```

## 🧪 Compatibility

| Device              | Status     |
|---------------------|------------|
| Raspberry Pi 4 B    | ✅ Tested  |
| Raspberry Pi 3 B+   | ✅ Tested  |
| Raspberry Pi Zero 2 | ⚠️ Expected |
| Pi OS Bookworm      | ✅ Tested  |
| Ubuntu ARM64        | ⚠️ Partial |

## Roadmap

- [ ] Optional web dashboard  
- [ ] Configurable intervals  
- [ ] Cloud photo backup  
- [ ] Sensor integration (light, moisture)  

## License

MIT © Ulemons
