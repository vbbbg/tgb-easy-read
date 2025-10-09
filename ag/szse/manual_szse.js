import { fetchAndTransformSzseData } from './fetch_szse.js';
import { saveData } from './db_szse.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===================================================================================
// 主执行函数
// ===================================================================================

async function main(year) {
    console.log(`Starting to fetch all SZSE data for the year ${year}...`);
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st
    let currentDate = startDate;

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`; // YYYY-MM-DD format

        console.log(`Fetching SZSE data for ${dateString}...`);
        // 将导入的 saveData 函数作为回调传入
        await fetchAndTransformSzseData(dateString, saveData);

        // Only delay if we are not on the last day
        if (currentDate < endDate) {
            console.log('Waiting for 5 seconds...');
            await delay(5000);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Finished fetching all SZSE data for ${year}.`);
}

// ===================================================================================
// 运行脚本
// ===================================================================================

// 在下面修改您想获取的年份，然后通过 node ag/szse/manual_szse.js 来运行此脚本
const yearToFetch = 2025;

main(yearToFetch).catch(console.error);