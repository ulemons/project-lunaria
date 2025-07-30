import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';
import { saveSeedConfig } from './config';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  console.log('🌱 Registering a new Lunaria Seed...');

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
  rl.close();
})();
