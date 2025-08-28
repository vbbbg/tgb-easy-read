// Base headers, cookie will be added dynamically
const baseHeaders = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'zh-CN,zh;q=0.9',
  'cache-control': 'max-age=0',
  'priority': 'u=0, i',
  'referer': 'https://www.tgb.cn/blog/2783773',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'x-exclude-login-mutex': '77ircloud'
};

/**
 * Fetches the HTML content of a given URL with a specific cookie.
 * @param {string} url The URL to fetch.
 * @param {string} cookie The cookie string to send with the request.
 * @returns {Promise<string>} A promise that resolves with the HTML content.
 */
export async function fetchPage(url, cookie) {
  const headers = {
    ...baseHeaders,
    'cookie': cookie
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching the URL:', error);
    throw error; // Re-throw the error after logging
  }
}

