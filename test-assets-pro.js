
const apiKey = "1b4guOFb06ZbALd3Td9oOSPRJxRBkksy";
const testCases = [
    { name: "S&P 500 (ETF)", symbol: "SPY", type: "stock" },
    { name: "Nasdaq 100 (ETF)", symbol: "QQQ", type: "stock" },
    { name: "Euro/Dólar", symbol: "C:EURUSD", type: "forex" },
    { name: "Oro (Futures)", symbol: "GC=F", type: "yahoo" },
    { name: "Oro (Polygon Ticker)", symbol: "XAUUSD", type: "forex_poly" },
    { name: "Tesla", symbol: "TSLA", type: "stock" }
];

async function runTests() {
    console.log("--- DIAGNÓSTICO DE ACTIVOS PRO ---");

    for (const item of testCases) {
        let url = "";
        if (item.type === "stock") {
            url = `https://api.polygon.io/v2/last/trade/${item.symbol}?apiKey=${apiKey}`;
        } else if (item.type === "forex" || item.type === "forex_poly") {
            url = `https://api.polygon.io/v1/last/quote/${item.symbol.startsWith("C:") ? item.symbol : "C:" + item.symbol}?apiKey=${apiKey}`;
        } else {
            console.log(`\n[${item.name}] Info: Saltando prueba Polygon (Yahoo fallback recomendado).`);
            continue;
        }

        try {
            console.log(`\nProbando ${item.name} (${item.symbol})...`);
            const res = await fetch(url);
            const data = await res.json();

            if (res.status === 200) {
                const price = data.results?.p || data.last?.price || data.last?.p || "No price field";
                console.log(`Status: 200 ✅ -> Precio: ${price}`);
            } else if (res.status === 403) {
                console.log(`Status: 403 ❌ -> Bloqueado: ${data.message || "No autorizado"}`);
                console.log(`  Intentando Fallback (Aggregates)...`);
                const fallbackUrl = `https://api.polygon.io/v2/aggs/ticker/${item.symbol.replace("C:", "")}/prev?apiKey=${apiKey}`;
                const fRes = await fetch(fallbackUrl);
                const fData = await fRes.json();
                if (fRes.status === 200 && fData.results) {
                    console.log(`  Fallback exitoso ✅ -> Último cierre: ${fData.results[0].c}`);
                } else {
                    console.log(`  Fallback fallido ❌`);
                }
            } else {
                console.log(`Status: ${res.status} ❓ -> Error: ${data.error || "Desconocido"}`);
            }
        } catch (e) {
            console.error(`Error crítico en ${item.symbol}:`, e.message);
        }
    }
}

runTests();
