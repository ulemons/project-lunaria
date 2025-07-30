# 🌱 Project Lunaria

Project Lunaria is inspired by a plant that blooms quietly, drops its seeds, and returns each year on its own.
Like the plant, this open-source project grows, spreads, and thrives through the community.
A small system that captures the beauty of time — one photo at a time. 🌙🌱




A time-lapse camera system built for Raspberry Pi to capture the growth of your plants — fully open source, built with TypeScript + Node.js.

## Features

- ⏱️ Takes a photo every hour using Raspberry Pi camera  
- 🗂️ Saves photos locally to `/photos` folder  

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

| Device                  | OS | Status     |
|-------------------------|----|------------|
| Raspberry Pi Zero W 1.1 |    | ⚠️ Expected |

## Roadmap

- refactor in moduli
- log che si sovrascrive fino a un limite massimo di linee
- riconoscere quando è buio
- configurazione con nomi in modo che posso avere più di un lunaria-seed
- cron per far partire allo startup lunaria 
- LLM per capire se una pianta sta bene oppure no ? 
- applicazione electron per interagire in wifi con il device
- scaricare il video
- integrazione meteo


---
- [ ] Optional web dashboard  
- [ ] Configurable intervals  
- [ ] Cloud photo backup  
- [ ] Sensor integration (light, moisture)  

## License

MIT © ulemons
