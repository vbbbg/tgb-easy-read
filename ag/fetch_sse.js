const SSE_URL = 'https://query.sse.com.cn/commonQuery.do';

const PRODUCT_CODE_MAP = {
    '01': 'main_a',
    '02': 'main_b',
    '03': 'sci_tech',
    '11': 'repo',
    '17': 'stock',
};

async function fetchSSEData(date) {
    const params = new URLSearchParams({
        jsonCallBack: `jsonpCallback${new Date().getTime()}`,
        sqlId: 'COMMON_SSE_SJ_GPSJ_CJGK_MRGK_C',
        PRODUCT_CODE: '01,02,03,11,17',
        type: 'inParams',
        SEARCH_DATE: date,
        '_': new Date().getTime(),
    });

    const url = `${SSE_URL}?${params.toString()}`;

    const response = await fetch(url, {
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Referer': 'https://www.sse.com.cn/',
            'Sec-Fetch-Dest': 'script',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        }
    });

    const text = await response.text();
    const jsonpData = text.match(/^jsonpCallback\d+\((.*)\)$/);
    if (!jsonpData || !jsonpData[1]) {
        throw new Error('Failed to parse JSONP response');
    }

    const data = JSON.parse(jsonpData[1]);
    if (!data.result || data.result.length === 0) {
        console.log(`No data for ${date}, skipping.`);
        return null;
    }

    return data.result;
}

function transformData(result) {
    const transformed = {
        trade_date: null,
    };

    result.forEach(item => {
        const prefix = PRODUCT_CODE_MAP[item.PRODUCT_CODE];
        if (prefix) {
            if (!transformed.trade_date) {
                transformed.trade_date = `${item.TRADE_DATE.slice(0, 4)}-${item.TRADE_DATE.slice(4, 6)}-${item.TRADE_DATE.slice(6, 8)}`;
            }
            transformed[`${prefix}_list_num`] = parseInt(item.LIST_NUM, 10);
            transformed[`${prefix}_total_value`] = parseFloat(item.TOTAL_VALUE);
            transformed[`${prefix}_nego_value`] = parseFloat(item.NEGO_VALUE);
            transformed[`${prefix}_trade_amt`] = parseFloat(item.TRADE_AMT);
            transformed[`${prefix}_trade_vol`] = parseFloat(item.TRADE_VOL);
            transformed[`${prefix}_avg_pe_rate`] = item.AVG_PE_RATE === '-' ? null : parseFloat(item.AVG_PE_RATE);
            transformed[`${prefix}_total_to_rate`] = parseFloat(item.TOTAL_TO_RATE);
            transformed[`${prefix}_nego_to_rate`] = parseFloat(item.NEGO_TO_RATE);
        }
    });

    return transformed;
}

export async function fetchAndSave(date, saveData) {
    try {
        const result = await fetchSSEData(date);
        if (result) {
            const transformedData = transformData(result);
            await saveData(transformedData);
        }
    } catch (error) {
        console.error(`Failed to fetch and save data for ${date}:`, error);
    }
}
