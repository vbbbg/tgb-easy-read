import cron from 'node-cron';
import { sync } from './sync_core.js';

const targetUrl = 'https://www.tgb.cn/a/2hIcnFHiTnx?type=X'; // You can change this URL

// Schedule the sync job
// 7:00 - 23:59, every 30min
cron.schedule('*/30 7-23 * * *', () => {
    sync(targetUrl);
});

console.log('Cron job scheduled to run every 30 minutes between 7:00 and 23:59.');

// Run once on start
sync(targetUrl);