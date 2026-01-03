import cron from 'node-cron';
import { sync } from './sync_core.js';
import { targetUrls } from './config.js';

const performAllSyncs = async () => {
    for (const baseUrl of targetUrls) {
        const urlObj = new URL(baseUrl);
        const postId = urlObj.pathname.split('/').pop().split('-')[0];

        const getNextPageUrl = page => {
            const [path, query] = baseUrl.split('?');
            if (page === 1) {
                return baseUrl;
            } else {
                return `${path}-${page}?${query}`;
            }
        };

        try {
            await sync(postId, getNextPageUrl);
        } catch (error) {
            console.error(`Failed to sync ${postId}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // 帖子之间等待10秒
    }
    console.log('Finished periodic sync for all posts.');
};

// Schedule the sync job
// 7:00 - 23:59, every 30min
cron.schedule('*/30 7-23 * * *', () => {
    console.log('Starting scheduled sync for all posts...');
    performAllSyncs();
});

console.log('Cron job scheduled to run every 30 minutes between 7:00 and 23:59.');

// Run once on start
performAllSyncs();
