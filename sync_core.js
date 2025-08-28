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

export async function sync(targetUrl, defaultMaxFloor = 0) {
    console.log('Starting sync...');
    try {
        const latestFloor = await getLatestFloor();
        const maxFloor = latestFloor > 0 ? latestFloor : defaultMaxFloor;

        console.log(`Fetching data from ${targetUrl}`);
        const htmlContent = await fetchPage(targetUrl, userCookie);
        const comments = parseComments(htmlContent);

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
        } else {
            console.log('No new comments to save.');
        }

    } catch (error) {
        console.error('Error during sync:', error);
    }
    console.log('Sync finished.');
}