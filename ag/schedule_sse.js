import cron from 'node-cron';
import { fetchAndSave } from "./fetch_sse.js";
import { saveData, getMaxDate } from "./db_sse.js";
import { delay } from "../utils/utils.js";

export function scheduleDailyFetch() {
    // Schedule to run at a specific time every day, e.g., 23:30
    cron.schedule('30 23 * * *', async () => {
        console.log('Running scheduled job to fetch missing SSE data.');

        let startDateStr = await getMaxDate();

        if (!startDateStr) return;

        const today = new Date();
        let currentDate = new Date(startDateStr);
        currentDate.setDate(currentDate.getDate() + 1); // Start from the day after the max date

        while (currentDate <= today) {
            const dateString = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`;

            console.log(`Fetching data for ${dateString}...`);
            await fetchAndSave(dateString, saveData);

            currentDate.setDate(currentDate.getDate() + 1);

            if (currentDate <= today) {
                console.log('Waiting for 5 seconds...');
                await delay(5000);
            }
        }

        console.log('Finished scheduled job for fetching missing data.');

    }, {
        scheduled: true,
        timezone: "Asia/Shanghai"
    });
}

scheduleDailyFetch();
console.log('SSE data fetcher for missing data is scheduled.');