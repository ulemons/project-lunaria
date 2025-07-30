import { execSync } from 'child_process';
import path from 'path';

const projectPath = path.resolve(__dirname, '..');
const logPath = path.join(projectPath, 'cron.log');
const command = `0 * * * * cd ${projectPath} && npm start >> ${logPath} 2>&1`;

try {
  const existing = execSync('crontab -l', { encoding: 'utf-8' });
  if (!existing.includes(command)) {
    const newCrontab = existing + '\n' + command + '\n';
    execSync(`echo "${newCrontab}" | crontab -`);
    console.log('[✓] Cron job added successfully.');
  } else {
    console.log('[i] Cron job already exists.');
  }
} catch (e) {
  const fallback = command + '\n';
  execSync(`echo "${fallback}" | crontab -`);
  console.log('[✓] Cron job created.');
}
