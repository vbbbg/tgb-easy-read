import { fetchAndTransformSzseData } from './fetch_szse.js'

async function test() {
    // Use a recent date for testing
    const testDate = '2025-09-26';
    console.log(`Testing with date: ${testDate}`);
    await fetchAndTransformSzseData(testDate, (data)=>{
        console.log(data)
    });
}

test();
