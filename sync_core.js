import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

import { fetchPage } from './fetch_tgb.js';
import { parseComments } from './parse_comments.js';

const supabaseUrl = process.env.SB_URL;
const supabaseKey = process.env.SB_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const userCookie = process.env.COOKIE;
const tableName = 'comments';

async function getLatestFloor() {
    const { data, error } = await supabase
        .from(tableName)
        .select('floor')
        .order('floor', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error getting latest floor:', error);
        return 0;
    }

    return data.length > 0 ? data[0].floor : 0;
}

async function saveComments(comments) {
    const { error } = await supabase
        .from(tableName)
        .upsert(comments, { onConflict: 'floor' });

    if (error) {
        console.error('Error saving comments:', error);
    } else {
        console.log(`Saved ${comments.length} comments.`);
    }
}

export async function sync(getNextPageUrl, defaultMaxFloor = 0) {
    console.log('Starting sync...');
    try {
        const latestFloor = await getLatestFloor();
        const maxFloor = latestFloor > 0 ? latestFloor : defaultMaxFloor;
        let currentPage = 1;
        let hasNewComments = true;

        while (hasNewComments) {
            const paginatedUrl = getNextPageUrl(currentPage);
            console.log(`Fetching data from ${paginatedUrl}`);
            const htmlContent = await fetchPage(paginatedUrl, userCookie);
            const comments = parseComments(htmlContent);

            if (comments.length === 0) {
                console.log(`No comments found on page ${currentPage}. Stopping sync.`);
                hasNewComments = false;
                break;
            }

            const newComments = comments.filter(comment => comment.floor > maxFloor);

            if (newComments.length > 0) {
                const commentsToInsert = newComments.map(c => ({
                    floor: c.floor,
                    user: c.user,
                    time: c.time,
                    is_op: c.isOP,
                    content: c.content,
                    quote: c.quote
                }));
                await saveComments(commentsToInsert);
                console.log(`Found and saved ${newComments.length} new comments from page ${currentPage}.`);
            } else {
                console.log(`No new comments (floor > ${maxFloor}) found on page ${currentPage}. Stopping sync.`);
                hasNewComments = false;
            }

            // If the lowest floor on the current page is less than or equal to maxFloor,
            // it means we've caught up with existing data, so we can stop.
            if (comments.length > 0 && comments[comments.length - 1].floor <= maxFloor) {
                console.log(`Reached existing comments (floor <= ${maxFloor}) on page ${currentPage}. Stopping sync.`);
                hasNewComments = false;
            }

            currentPage++;
            // Wait for 5 seconds before fetching the next page
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

    } catch (error) {
        console.error('Error during sync:', error);
    }
    console.log('Sync finished.');
}