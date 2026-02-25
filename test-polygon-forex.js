
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testForexSnapshot() {
    const apiKey = process.env.POLYGON_API_KEY;
    const ticker = "C:EURUSD";
    const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/forex/tickers/${ticker}?apiKey=${apiKey}`;

    console.log(`Testing Forex Snapshot: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testForexSnapshot();
