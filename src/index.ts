import { CronJob } from 'cron';
import { ensurePhotosDir, takePhoto } from './camera';
import { startApiServer } from './api';
import { CRON_5_MINUTES, CRON_15_MINUTES, CRON_30_MINUTES, CRON_HOURLY } from './constants';
import { loadSeedConfig } from './config';

export function startLunaria(): void {
  ensurePhotosDir();

  // Load configuration to get the photo interval
  const config = loadSeedConfig();
  const intervalType = config?.interval || 'CRON_HOURLY';
  
  // Map interval type to actual cron expression
  const cronExpressions: Record<string, string> = {
    'CRON_5_MINUTES': CRON_5_MINUTES,
    'CRON_15_MINUTES': CRON_15_MINUTES,
    'CRON_30_MINUTES': CRON_30_MINUTES,
    'CRON_HOURLY': CRON_HOURLY
  };
  
  const cronExpression = cronExpressions[intervalType] || CRON_HOURLY;
  
  // Schedule photo taking with configured interval
  new CronJob(cronExpression, takePhoto, null, true, 'UTC');

  const intervalLabels: Record<string, string> = {
    'CRON_5_MINUTES': 'every 5 minutes',
    'CRON_15_MINUTES': 'every 15 minutes', 
    'CRON_30_MINUTES': 'every 30 minutes',
    'CRON_HOURLY': 'every hour'
  };
  
  const intervalLabel = intervalLabels[intervalType] || 'every hour';
  console.log(`[🌱] Project Lunaria started. Taking photos ${intervalLabel}.`);
}

// Start API and Lunaria when run directly
if (require.main === module) {
  startApiServer();
  startLunaria();
}
