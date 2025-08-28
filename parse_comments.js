import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('page.html', 'utf-8');
const $ = cheerio.load(html);

const comments = [];

// 首先，处理主楼内容 (楼主的原始帖子)
const opContent = $('.article-text.p_coten').first().text().trim();
const opUser = $('.article-data .data-userid a').first().text().trim();
const opTime = $('.article-data > span').text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)[0];

comments.push({
    floor: 1, // 主楼是1楼
    user: opUser,
    time: opTime,
    isOP: true,
    content: opContent,
    quote: null, // 主楼没有引用
});


// 然后，处理所有跟帖
$('.comment-lists .comment-data').each((i, el) => {
    const commentDiv = $(el);
    const user = commentDiv.find('.user-name').text().trim();
    const content = commentDiv.find('.comment-data-text').text().trim();
    const time = commentDiv.find('.pcyclspan').text().trim();
    let floor = null;
    let quote = null;

    // 提取引用内容为对象
    const quoteDiv = commentDiv.find('.comment-data-quote');
    if (quoteDiv.length > 0) {
        const quoteUser = quoteDiv.find('.data-quote-right a').first().text().trim();
        const quoteTime = quoteDiv.find('.data-quote-right > div > span').first().text().trim();
        const quoteContent = quoteDiv.find('.quote-content').text().trim();
        quote = {
            user: quoteUser,
            time: quoteTime,
            content: quoteContent,
        };
    }

    // 解析楼层号
    const buttonSpan = commentDiv.find('.comment-data-button > .left');
    if (buttonSpan.length > 0) {
        const spanText = buttonSpan.text().trim();
        const floorMatch = spanText.match(/第(\d+)楼/);
        if (floorMatch && floorMatch[1]) {
            floor = parseInt(floorMatch[1], 10);
        }
    }

    // 检查是否是楼主
    const isOP = commentDiv.find('span:contains("楼主")').length > 0;

    // 只有在成功解析出楼层号的情况下才添加到数组
    if (floor !== null) {
        comments.push({
            floor,
            user,
            time,
            isOP,
            content,
            quote,
        });
    }
});

console.log(JSON.stringify(comments, null, 2));