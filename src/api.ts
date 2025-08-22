// src/api.ts
import express from 'express';
import fs from 'fs';
import path from 'path';
import { loadSeedConfig } from './config';

export function startApiServer(): void {
  const config = loadSeedConfig();
  if (!config || !config.exposeApi) {
    console.warn('[i] API not enabled or config missing.');
    return;
  }


  const app = express();
  const photosPath = path.resolve(config.photosDir);

  app.get('/status', (_, res) => {
    res.json({
      seedId: config.seedId,
      name: config.name,
      location: config.location,
      owner: config.owner
    });
  });

  app.get('/photos', (_, res) => {
    fs.readdir(photosPath, (err, files) => {
      if (err) {
        res.status(500).send('Unable to read photos directory.');
      } else {
        const jpgs = files.filter(f => f.endsWith('.jpg'));
        res.json(jpgs);
      }
    });
  });

  app.get('/photo/:filename', (req, res) => {
    const file = path.join(photosPath, req.params.filename);
    if (!fs.existsSync(file)) {
      res.status(404).send('Photo not found');
    } else {
      res.sendFile(file);
    }
  });

  app.listen(config.port, () => {
    console.log(`[🌐] Lunaria API running on http://localhost:${config.port}`);
  });
}
