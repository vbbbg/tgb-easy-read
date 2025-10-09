import { supabase } from '../../utils/supbase.js';

/**
 * Saves the provided records to the Supabase database.
 * @param {Array} records - An array of records to be saved.
 */
export async function saveData(records) {
    if (!records || records.length === 0) {
        console.log('No records provided to save.');
        return;
    }

    const { error } = await supabase.from('szse_market_summary').upsert(records);

    if (error) {
        console.error(`Error saving SZSE data:`, error);
    } else {
        console.log(`Successfully saved ${records.length} records for SZSE data on ${records[0].trade_date}.`);
    }
}
