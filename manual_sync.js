import { sync } from './sync_core.js';
import { targetUrls } from './config.js';

const runManualSync = async () => {
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

        await sync(postId, getNextPageUrl);
        console.log(`Waiting before next post...`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 帖子之间等待10秒
    }
    console.log('All manual syncs completed.');
};

runManualSync();
