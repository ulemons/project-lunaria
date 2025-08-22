# 🌱 Project Lunaria

Project Lunaria is inspired by a plant that blooms quietly, drops its seeds, and returns each year on its own.
Like the plant, this open-source project grows, spreads, and thrives through the community.
A small system that captures the beauty of time — one photo at a time. 🌙🌱




A time-lapse camera system built for Raspberry Pi to capture the growth of your plants — fully open source, built with TypeScript + Node.js.

## Features

- ⏱️ Takes a photo every hour using Raspberry Pi camera  
- 🗂️ Saves photos locally to `/photos` folder  

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

### Run The project

Now it is time to clone the repository:

Clone the project:
```bash
git clone https://github.com/ulemons/project-lunaria.git
cd project-lunaria
```

📦 Build the project:
```bash
npm install
npm run build
```

🌱 We recommend registering your Lunaria seed with the following command:
```bash
npm run register
```

▶️ Start it manually:
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



## 🧪 Compatibility

| Device                  | OS | Status     | Note |
|-------------------------|----|------------|------|
| Raspberry Pi Zero W 1.1 |    |      ❌    |Currently unsupported due to hardware limitations.      |

## Roadmap

### Seed Development
1. Seed Discovery: we want to give the ability to find all the seed in your network
2. Seed Configuration: once you have found all your seeds via api you should be able to update some configuration (e.g add a profile picture of the seed)
3. LLm to understand weather the plant is in a good shape or not
4. Weather Integration
5. Api to download pictures with range
6. Can we make the configuration of the service more automatic ?
7. Can a user update the wifi user/password just via bluetooth ? 

### App Development
1. Electron app skeleton

## License

This project is licensed under the **MIT License**.  
© 2025 Umberto Sgueglia (ulemons). See [LICENSE](./LICENSE) for details.