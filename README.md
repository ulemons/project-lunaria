# 🌱 Project Lunaria

Project Lunaria is inspired by a plant that blooms quietly, drops its seeds, and returns each year on its own.
Like the plant, this open-source project grows, spreads, and thrives through the community.
A small system that captures the beauty of time — one photo at a time. 🌙🌱




A time-lapse camera system built for Raspberry Pi to capture the growth of your plants — fully open source, built with TypeScript + Node.js.

## Features

- ⏱️ Takes a photo every hour using Raspberry Pi camera  
- 🗂️ Saves photos locally to `/photos` folder  

## Installation

### dependencies:

install nodeJs using nvm:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```


restart the terminal, now you should be able to run:
```
nvm install node
```

oppure versione precompilata: 
cd ~
wget https://unofficial-builds.nodejs.org/download/release/v18.17.1/node-v18.17.1-linux-armv6l.tar.gz
tar -xzf node-v18.17.1-linux-armv6l.tar.gz
sudo cp -R node-v18.17.1-linux-armv6l/* /usr/local/

```bash
git clone https://github.com/your-username/project-lunaria.git
cd project-lunaria
npm install
```

📦 Build the project:
```bash
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

## Avvio automatico con systemd

Per avviare Lunaria automaticamente al boot del sistema (es. Raspberry Pi o Linux server), segui questi passaggi:

### 1. Trova il path completo di Node.js e del progetto

Apri il terminale ed esegui:

```bash
which node
which npm
```

Annota i percorsi (es. `/usr/bin/node`, `/usr/local/bin/npm`).

Poi individua la cartella del progetto, ad esempio:

```bash
/home/ubuntu/lunaria
```

### 2. Crea un file di servizio systemd

Apri il file del servizio:

```bash
sudo nano /etc/systemd/system/lunaria.service
```

Incolla il seguente contenuto, modificando `WorkingDirectory`, `ExecStart`, `User` e `PATH` se necessario:

```ini
[Unit]
Description=Avvio automatico del progetto Lunaria
After=network.target

[Service]
ExecStart=/usr/local/bin/npm run start
WorkingDirectory=/home/ubuntu/lunaria
Restart=always
User=ubuntu
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

> **Nota**: sostituisci `ubuntu` con il tuo nome utente (verificabile con `whoami`).

### 3. Attiva e avvia il servizio

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable lunaria.service
sudo systemctl start lunaria.service
```

### 4. Verifica che funzioni

Controlla lo stato del servizio:

```bash
sudo systemctl status lunaria.service
```

E monitora i log in tempo reale:

```bash
journalctl -u lunaria.service -f
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
