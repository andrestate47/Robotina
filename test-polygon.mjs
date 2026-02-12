import { restClient } from "@polygon.io/client-js";

const API_KEY = "N9sWt6YbB9SOdX0bK7QTU37X1sRv2f2R";
const polygon = restClient(API_KEY);

console.log("Testing Polygon API...");

try {
    console.log("--- Testing Stock (AAPL) ---");
    const appl = await polygon.stocks.previousClose("AAPL");
    console.log("AAPL:", appl.results?.[0]?.c);
} catch (e) {
    console.error("AAPL Failed:", e);
}

try {
    console.log("--- Testing Index (I:NDX) ---");
    const ndx = await polygon.stocks.previousClose("I:NDX");
    console.log("NDX:", ndx.results?.[0]?.c);
} catch (e) {
    console.error("NDX Failed:", e);
}
