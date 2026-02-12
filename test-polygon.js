const { restClient } = require("@polygon.io/client-js");

const API_KEY = process.env.POLYGON_API_KEY || "N9sWt6YbB9SOdX0bK7QTU37X1sRv2f2R";
const polygon = restClient(API_KEY);

async function test() {
    console.log("Testing Polygon API with key:", API_KEY);

    try {
        console.log("--- Testing Stock (AAPL) ---");
        const appl = await polygon.stocks.previousClose("AAPL");
        console.log("AAPL Result:", appl.results?.[0]?.c || "No data");
    } catch (e) {
        console.error("AAPL Failed:", e.message);
    }

    try {
        console.log("--- Testing Index (I:NDX) ---");
        const ndx = await polygon.stocks.previousClose("I:NDX");
        console.log("NDX Result:", ndx.results?.[0]?.c || "No data");
    } catch (e) {
        console.error("NDX Failed:", e.message);
    }

    try {
        console.log("--- Testing Crypto (X:BTCUSD) ---");
        const btc = await polygon.stocks.previousClose("X:BTCUSD");
        console.log("BTC Result:", btc.results?.[0]?.c || "No data");
    } catch (e) {
        console.error("BTC Failed:", e.message);
    }
}

test();
