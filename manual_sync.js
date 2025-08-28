import { sync } from './sync_core.js';

const baseUrl = 'https://www.tgb.cn/a/2hIcnFHiTnx?type=X'; // You can change this URL

const getNextPageUrl = (page) => {
    const [path, query] = baseUrl.split('?');
    if (page === 1) {
        return baseUrl;
    } else {
        return `${path}-${page}?${query}`;
    }
};

// Run the sync
sync(getNextPageUrl);