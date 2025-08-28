import * as cheerio from 'cheerio';

export function parseComments(html) {
    const $ = cheerio.load(html);

    const comments = [];

    function getImageUrl(imageElement) {
        if (!imageElement || imageElement.length === 0) {
            return null;
        }
        return imageElement.attr('src2') || imageElement.attr('src');
    }

// 首先，处理主楼内容 (楼主的原始帖子)
    const opDiv = $('.article-text.p_coten').first();
    let opContent;
    const opImage = opDiv.find('img');
    const opImageUrl = getImageUrl(opImage);

    if (opImageUrl) {
        opContent = {
            text: opDiv.contents().filter((index, contentEl) => contentEl.type === 'text').text().trim(),
            image: opImageUrl
        };
    } else {
        opContent = {text: opDiv.text().trim()};
    }
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
        const commentDataText = commentDiv.find('.comment-data-text');
        let content;
        const image = commentDataText.find('img');
        const imageUrl = getImageUrl(image);

        if (imageUrl) {
            content = {
                text: commentDataText.contents().filter((index, contentEl) => contentEl.type === 'text').text().trim(),
                image: imageUrl
            };
        } else {
            content = {text: commentDataText.text().trim()};
        }
        const time = commentDiv.find('.pcyclspan').text().trim();
        let floor = null;
        let quote = null;

        // 提取引用内容为对象
        const quoteDiv = commentDiv.find('.comment-data-quote');
        if (quoteDiv.length > 0) {
            const quoteUser = quoteDiv.find('.data-quote-right a').first().text().trim();
            const quoteTime = quoteDiv.find('.data-quote-right > div > span').first().text().trim();
            const quoteContentDiv = quoteDiv.find('.quote-content');
            let quoteContent;
            const quoteImage = quoteContentDiv.find('img');
            const quoteImageUrl = getImageUrl(quoteImage);

            if (quoteImageUrl) {
                quoteContent = {
                    text: quoteContentDiv.contents().filter((index, contentEl) => contentEl.type === 'text').text().trim(),
                    image: quoteImageUrl
                };
            } else {
                quoteContent = {text: quoteContentDiv.text().trim()};
            }
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

    return comments;
}