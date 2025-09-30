import { supabase } from '../utils/supbase.js'

export async function saveData(data) {
    const { error } = await supabase
        .from('sse_market_summary')
        .upsert(data, { onConflict: 'trade_date' });

    if (error) {
        console.error('Error saving data:', error);
    } else {
        console.log(`Successfully saved data for ${data.trade_date}`);
    }
}

export async function getMaxDate() {
    const { data, error } = await supabase
        .from('sse_market_summary')
        .select('trade_date')
        .order('trade_date', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error getting max date:', error);
        return null;
    }

    return data && data.length > 0 ? data[0].trade_date : null;
}