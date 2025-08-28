// main.js

import 'dotenv/config';
import { fetchPage } from './fetch_tgb.js';

// --- 请在这里配置您的参数 ---
const targetUrl = 'https://www.tgb.cn/a/1zIFg1DxvjJ';

// 替换为您的完整 cookie 字符串
const userCookie = process.env.COOKIE;

(async () => {
  try {
    console.log(`正在从 ${targetUrl} 获取内容...`);
    const htmlContent = await fetchPage(targetUrl, userCookie);
    console.log(htmlContent);
  } catch (error) {
    console.error('❌ 获取页面失败:', error.message);
  }
})()