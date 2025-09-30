import { createClient } from '@supabase/supabase-js';

// ===================================================================================
// 1. 数据获取逻辑 (从 fetch_sse.js 移植)
// ===================================================================================
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
        SEARCH_DATE: date, // YYYYMMDD 格式
        '_': new Date().getTime(),
    });

    const url = `${SSE_URL}?${params.toString()}`;
    const response = await fetch(url, {
        headers: {
            'Referer': 'https://www.sse.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        }
    });

    const text = await response.text();
    const jsonpData = text.match(/^jsonpCallback\d+\((.*)\)$/);
    if (!jsonpData || !jsonpData[1]) {
        console.error('Failed to parse JSONP response:', text);
        return null;
    }

    const data = JSON.parse(jsonpData[1]);
    if (!data.result || data.result.length === 0) {
        console.log(`No data for ${date}, skipping.`);
        return null;
    }
    return data.result;
}

function transformData(result) {
    const transformed = { trade_date: null };
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

// ===================================================================================
// 2. 数据库交互逻辑 (从 db_sse.js 移植)
// ===================================================================================

async function getMaxDate(supabase) {
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

async function saveData(supabase, data) {
    const { error } = await supabase
        .from('sse_market_summary')
        .upsert(data, { onConflict: 'trade_date' });

    if (error) {
        console.error('Error saving data:', error);
    } else {
        console.log(`Successfully saved data for ${data.trade_date}`);
    }
}

// ===================================================================================
// 3. Cloudflare Worker 入口点
// ===================================================================================

export default {
    /**
     * @param {ScheduledController} controller
     * @param {object} env - 您在 Cloudflare 中设置的 Secrets 和 KV anmespaces
     * @param {ExecutionContext} ctx
     */
    async scheduled(controller, env, ctx) {
        console.log("Cron job started...");

        // 初始化 Supabase 客户端
        // 请确保您已在 Cloudflare Worker 的后台设置了 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // 1. 获取北京时间的当前日期
        const todayInUTC = new Date();
        const chinaTimezoneOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        const today = new Date(todayInUTC.getTime() + chinaTimezoneOffset);

        // 2. 格式化日期 (使用 UTC 方法从调整后的日期对象中提取)
        const year = today.getUTCFullYear();
        const month = String(today.getUTCMonth() + 1).padStart(2, '0');
        const day = String(today.getUTCDate()).padStart(2, '0');
        const dateStringForAPI = `${year}${month}${day}`;

        console.log(`Fetching data for current date: ${year}-${month}-${day}...`);
        const rawData = await fetchSSEData(dateStringForAPI);

        // 5. 如果获取到数据，则转换并保存
        if (rawData) {
            const transformedData = transformData(rawData);
            // 确保转换后的日期是正确的
            if (transformedData.trade_date) {
                await saveData(supabase, transformedData);
            } else {
                console.log(`Skipping save because transformed data has no trade_date for ${dateStringForAPI}`);
            }
        }

        console.log("Cron job finished.");
    },
};