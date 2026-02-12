const POLYGON_KEY = "N9sWt6YbB9SOdX0bK7QTU37X1sRv2f2R";

// Mock de Yahoo para simplificar (o usar fetch directo si es público)
async function fetchYahooPrice(symbol) {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
        const res = await fetch(url);
        const data = await res.json();
        return data.chart?.result?.[0]?.meta?.regularMarketPrice || "Error";
    } catch {
        return "Blocked/Error";
    }
}

async function fetchPolygonPrice(ticker) {
    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.results?.[0]?.c || "No Data (Free Tier Block?)";
    } catch {
        return "Error";
    }
}

async function runPrecisionTest() {
    console.log("🔍 INICIANDO PRUEBA DE PRECISIÓN DE DATOS...");
    console.log("=========================================");

    const assets = [
        { name: "Apple", polygon: "AAPL", yahoo: "AAPL", type: "Stock" },
        { name: "Nasdaq 100", polygon: "I:NDX", yahoo: "%5ENDX", type: "Index" }, // %5E is URL encoded ^
        { name: "S&P 500", polygon: "I:SPX", yahoo: "%5EGSPC", type: "Index" },
        { name: "Bitcoin", polygon: "X:BTCUSD", yahoo: "BTC-USD", type: "Crypto" },
        { name: "Eur/Usd", polygon: "C:EURUSD", yahoo: "EURUSD=X", type: "Forex" }
    ];

    for (const asset of assets) {
        console.log(`\nProbando ${asset.name} (${asset.type})...`);

        const pricePoly = await fetchPolygonPrice(asset.polygon);
        const priceYahoo = await fetchYahooPrice(asset.yahoo);

        console.log(`   🔸 Polygon (${asset.polygon}): ${pricePoly}`);
        console.log(`   🔹 Yahoo   (${decodeURIComponent(asset.yahoo)}): ${priceYahoo}`);

        if (typeof pricePoly === 'number' && typeof priceYahoo === 'number') {
            const diff = Math.abs(pricePoly - priceYahoo);
            const pct = (diff / priceYahoo) * 100;
            console.log(`   📊 Diferencia: ${diff.toFixed(2)} (${pct.toFixed(2)}%)`);

            if (pct < 0.5) console.log("   ✅ PRECISIÓN ALTA (Datos coinciden)");
            else console.log("   ⚠️ PRECISIÓN BAJA o DATOS DIFERIDOS");
        } else {
            console.log("   ❌ Comparación imposible (Uno falló)");
        }
    }
    console.log("\n=========================================");
}

runPrecisionTest();
