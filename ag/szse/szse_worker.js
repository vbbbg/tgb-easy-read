import { createClient } from '@supabase/supabase-js';
import { fetchAndTransformSzseData } from './fetch_szse.js';

export default {
    async scheduled(controller, env, ctx) {
        console.log("SZSE cron job started...");

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        /**
         * Defines the data saving logic specific to this worker's context.
         * @param {Array} records - An array of records to be saved.
         */
        async function saveData(records) {
            if (!records || records.length === 0) {
                console.log('SZSE Worker: No records provided to save.');
                return;
            }
            const { error } = await supabase.from('szse_market_summary').upsert(records);
            if (error) {
                console.error(`SZSE Worker: Error saving data:`, error);
            } else {
                console.log(`SZSE Worker: Successfully saved ${records.length} records for ${records[0].trade_date}.`);
            }
        }

        // 1. Get the current date in China timezone
        const todayInUTC = new Date();
        const chinaTimezoneOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        const today = new Date(todayInUTC.getTime() + chinaTimezoneOffset);

        // 2. Format the date to YYYY-MM-DD
        const year = today.getUTCFullYear();
        const month = String(today.getUTCMonth() + 1).padStart(2, '0');
        const day = String(today.getUTCDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // 3. Call the shared module to perform the task
        console.log(`SZSE Worker: Fetching data for current date: ${dateString}...`);
        await fetchAndTransformSzseData(dateString, saveData);

        console.log("SZSE cron job finished.");
    },
};