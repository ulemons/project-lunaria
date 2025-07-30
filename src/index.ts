import { CronJob } from 'cron';
import { ensurePhotosDir, takePhoto } from './camera';
import { startApiServer } from './api';

export function startLunaria(): void {
  ensurePhotosDir();

  // Run every hour on the hour
  const job = new CronJob('0 0 * * * *', takePhoto, null, true, 'UTC');

  console.log('[🌱] Project Lunaria started. Taking photos every hour.');
}

// Start API and Lunaria when run directly
if (require.main === module) {
  startApiServer();
  startLunaria();
}
