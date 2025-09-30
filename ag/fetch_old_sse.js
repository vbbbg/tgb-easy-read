const SSE_URL = 'https://query.sse.com.cn/commonQuery.do';

// Mapping from PRODUCT_TYPE in the API response to the prefixes used in the database schema
const PRODUCT_TYPE_MAP = {
    '40': 'stock',    // 股票
    '1': 'main_a',   // 主板A
    '2': 'main_b',   // 主板B
    '48': 'sci_tech', // 科创板
    '43': 'repo',     // 股票回购
};

async function fetchOldSSEData(date) {
    const params = new URLSearchParams({
        jsonCallBack: `jsonpCallback${new Date().getTime()}`,
        sqlId: 'COMMON_SSE_SJ_GPSJ_CJGK_DAYCJGK_C',
        searchDate: date, // YYYY-MM-DD
        stockType: '90',
        '_': new Date().getTime(),
    });

    const url = `${SSE_URL}?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'Accept': '*/*',
            'Referer': 'https://www.sse.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        }
    });

    const text = await response.text();
    const jsonpMatch = text.match(/^jsonpCallback\d+\((.*)\)$/);
    if (!jsonpMatch || !jsonpMatch[1]) {
        throw new Error(`Failed to parse JSONP response for date: ${date}`);
    }

    const data = JSON.parse(jsonpMatch[1]);
    if (!data.result || data.result.length === 0) {
        console.log(`No data for ${date}, skipping.`);
        return null;
    }

    return data.result;
}

function transformData(result, date) {
    const transformed = {
        trade_date: date,
    };

    result.forEach(item => {
        const prefix = PRODUCT_TYPE_MAP[item.PRODUCT_TYPE];
        if (prefix) {
            transformed[`${prefix}_list_num`] = parseInt(item.TX_NUM, 10) || null;
            transformed[`${prefix}_total_value`] = parseFloat(item.MKT_VALUE) || null;
            transformed[`${prefix}_nego_value`] = parseFloat(item.NEGOTIABLE_VALUE) || null;
            transformed[`${prefix}_trade_amt`] = parseFloat(item.TX_AMOUNT) || null;
            transformed[`${prefix}_trade_vol`] = parseFloat(item.TX_VOLUME) || null;
            transformed[`${prefix}_avg_pe_rate`] = parseFloat(item.AVG_PROFIT_RATE) || null;
            transformed[`${prefix}_total_to_rate`] = parseFloat(item.TOTAL_MK_CAP_RATE) || null;
            transformed[`${prefix}_nego_to_rate`] = parseFloat(item.EXCHANGE_RATE) || null;
        }
    });

    return transformed;
}

export async function fetchAndSaveOldData(date, saveDataFunc) {
    try {
        const result = await fetchOldSSEData(date);
        if (result) {
            const transformedData = transformData(result, date);
            await saveDataFunc(transformedData);
        }
    } catch (error) {
        console.error(`Failed to fetch and save old data for ${date}:`, error);
    }
}
