
const apiKey = "1b4guOFb06ZbALd3Td9oOSPRJxRBkksy";
const symbols = ["AAPL", "TSLA", "EURUSD"];

async function testPolygon() {
    console.log("--- TEST POLYGON PRO (RE-VERIFIED) ---");

    for (const symbol of symbols) {
        let url = "";
        if (symbol === "EURUSD") {
            url = `https://api.polygon.io/v1/last/quote/C:EURUSD?apiKey=${apiKey}`;
        } else {
            url = `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${apiKey}`;
        }

        try {
            console.log(`\nTesting ${symbol}...`);
            const res = await fetch(url);
            const data = await res.json();

            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                console.log("SUCCESS ✅");
                console.log("Symbol:", symbol);
                if (data.results) {
                    console.log("Last Price:", data.results.p || data.results.price);
                } else if (data.last) {
                    console.log("Last Price:", data.last.price || data.last.p);
                }
            } else {
                console.log("ERROR ❌:", JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error("CRITICAL FETCH ERROR:", e);
        }
    }
}

testPolygon();
