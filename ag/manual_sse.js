import { fetchAndSaveOldData } from './fetch_old_sse.js';
import { saveData } from './db_sse.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main(year) {
    const startDate = new Date(year, 0, 1); // January 1st, 2024
    const endDate = new Date(year, 11, 31); // December 31st, 2024
    let currentDate = startDate;

    while (currentDate <= endDate) {
        const dateString = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`;

        console.log(`Fetching data for ${dateString}...`);
        await fetchAndSaveOldData(dateString, saveData);

        console.log('Waiting for 5 seconds...');
        await delay(5000);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Finished fetching all data for 2024.');
}

main(2021).catch(console.error);