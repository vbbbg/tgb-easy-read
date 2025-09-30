import { fetchAndSave } from './fetch_sse.js'

async function test() {
    // Use a recent date for testing
    const testDate = '2025-09-26'; 
    console.log(`Testing with date: ${testDate}`);
    await fetchAndSave(testDate, (data)=>{
        console.log(data)
    });
}

test();
