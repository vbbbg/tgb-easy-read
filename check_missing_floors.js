import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SB_URL;
const supabaseKey = process.env.SB_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tableName = 'comments';

async function checkMissingFloors(minFloor = 1, maxFloorParam = null) {
    console.log('Checking for missing floor numbers...');
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('floor')
            .order('floor', { ascending: true });

        if (error) {
            console.error('Error fetching floors:', error);
            return;
        }

        if (data.length === 0) {
            console.log('No comments found in the database.');
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
// To check all missing floors from 1 up to the database's max floor:
// checkMissingFloors();

// To check missing floors from 100 to 200:
// checkMissingFloors(100, 200);

// To check missing floors from 50 up to the database's max floor:
// checkMissingFloors(50);

// You can call it with arguments from process.argv if you want to run it from the command line
const args = process.argv.slice(2);
const min = args[0] ? parseInt(args[0], 10) : 34751;
const max = args[1] ? parseInt(args[1], 10) : undefined;

checkMissingFloors(min, max);