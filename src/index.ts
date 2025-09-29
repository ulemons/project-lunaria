import { CronJob } from 'cron';
import { ensurePhotosDir, takePhoto } from './camera';
import { startApiServer } from './api';
import { CRON_HOURLY } from './constants';

export function startLunaria(): void {
  ensurePhotosDir();

  // Run every hour on the hour
  const job = new CronJob(CRON_HOURLY, takePhoto, null, true, 'UTC');

  console.log('[🌱] Project Lunaria started. Taking photos of your plants.');
}

// Start API and Lunaria when run directly
if (require.main === module) {
  startApiServer();
  startLunaria();
}
