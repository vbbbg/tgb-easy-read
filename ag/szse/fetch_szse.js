const API_URL = 'https://www.szse.cn/api/report/ShowReport/data';

/**
 * Fetches raw market data from SZSE for a given date.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<Array|null>} A promise that resolves to an array of data objects, or null if fetching fails.
 */
async function fetchSZSEData(date) {
    const params = new URLSearchParams({
        SHOWTYPE: 'JSON',
        CATALOGID: '1803_sczm',
        TABKEY: 'tab1',
        txtQueryDate: date,
        random: Math.random(),
    });

    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Referer': `https://www.szse.cn/market/overview/?tabkey=tab1&txtQueryDate=${date}`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        }
    });

    if (!response.ok) {
        console.error(`Failed to fetch SZSE data for ${date}. Status: ${response.status}`);
        return null;
    }

    const jsonResponse = await response.json();
    if (!jsonResponse || !jsonResponse[0] || !jsonResponse[0].data) {
        console.log(`No data found in SZSE response for ${date}.`);
        return null;
    }
    return jsonResponse[0].data;
}

/**
 * Parses a string value into a number, handling commas and hyphens.
 * @param {string} value - The string to parse.
 * @returns {number|null} The parsed number or null.
 */
function parseNumber(value) {
    if (typeof value !== 'string' || value.trim() === '-') return null;
    return parseFloat(value.replace(/,/g, '')) || null;
}

/**
 * Transforms the raw API data into a structured format for saving.
 * @param {Array} data - The raw data array from the API.
 * @param {string} date - The trade date.
 * @returns {Array} An array of structured record objects.
 */
function transformSzseData(data, date) {
    return data.map(item => ({
        trade_date: date,
        trade_category: item.lbmc.replace(/&nbsp;/g, '').trim(),
        quantity: parseInt(item.zqsl, 10) || null,
        trade_amount: parseNumber(item.cjje),
        total_market_cap: parseNumber(item.sjzz),
        negotiable_market_cap: parseNumber(item.ltsz),
    }));
}

/**
 * The main exported function to orchestrate fetching and transforming SZSE data.
 * It accepts a saveData function to handle the storage.
 * @param {string} date - The date to fetch data for (YYYY-MM-DD).
 * @param {Function} saveDataFunc - An async function that takes an array of records and saves them.
 */
export async function fetchAndTransformSzseData(date, saveDataFunc) {
    try {
        const rawData = await fetchSZSEData(date);
        if (rawData && rawData.length > 0) {
            const recordsToSave = transformSzseData(rawData, date);
            if (recordsToSave.length > 0) {
                await saveDataFunc(recordsToSave);
            }
        }
    } catch (error) {
        console.error(`Failed to fetch and save SZSE data for ${date}:`, error);
    }
}