import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SB_URL;
const supabaseKey = process.env.SB_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tableName = 'comments';

async function checkMissingFloors(postId, minFloor = 1, maxFloorParam = null) {
    console.log(`Checking for missing floor numbers for post: ${postId}...`);
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('floor')
            .eq('post_id', postId)
            .order('floor', { ascending: true });

        if (error) {
            console.error('Error fetching floors:', error);
            return;
        }

        if (data.length === 0) {
            console.log(`No comments found in the database for post: ${postId}.`);
            return;
        }

        const allFloors = data.map(item => item.floor);
        const dbMaxFloor = Math.max(...allFloors);

        const effectiveMaxFloor = maxFloorParam !== null ? maxFloorParam : dbMaxFloor;

        console.log(`Checking floors from ${minFloor} to ${effectiveMaxFloor}`);

        const existingFloorsSet = new Set(allFloors.filter(f => f >= minFloor && f <= effectiveMaxFloor));
        const missingFloors = [];

        for (let i = minFloor; i <= effectiveMaxFloor; i++) {
            if (!existingFloorsSet.has(i)) {
                missingFloors.push(i);
            }
        }

        if (missingFloors.length > 0) {
            console.log('Missing floor numbers:');
            console.log(missingFloors.join(', '));
        } else {
            console.log('No missing floor numbers found in the specified range.');
        }
    } catch (error) {
        console.error('Error during missing floor check:', error);
    }
    console.log('Missing floor check finished.');
}

// Example usage:
// checkMissingFloors('2hIcnFHiTnx');

const args = process.argv.slice(2);
const postId = args[0] || '2hIcnFHiTnx';
const min = args[1] ? parseInt(args[1], 10) : 1;
const max = args[2] ? parseInt(args[2], 10) : undefined;

checkMissingFloors(postId, min, max);
