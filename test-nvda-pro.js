
const apiKey = "1b4guOFb06ZbALd3Td9oOSPRJxRBkksy";
const testStock = "NVDA";

async function testNVDA() {
    console.log(`--- PRUEBA DE FUEGO: ${testStock} ---`);

    // Ruta A: Last Trade (Probablemente 403 en Starter)
    const urlA = `https://api.polygon.io/v2/last/trade/${testStock}?apiKey=${apiKey}`;
    // Ruta B: Aggregates Prev (Incluido en Starter)
    const urlB = `https://api.polygon.io/v2/aggs/ticker/${testStock}/prev?apiKey=${apiKey}`;

    try {
        console.log(`Chequeando precio real para ${testStock}...`);
        const resA = await fetch(urlA);
        const dataA = await resA.json();

        if (resA.status === 200) {
            console.log("¡WOW! Tienes acceso a tiempo real (Last Trade) ✅");
            console.log("Precio:", dataA.results.p);
        } else {
            console.log(`Status 403: Last Trade bloqueado (Cuestión de Plan).`);
            console.log("Intentando Fallback PRO (Aggregates)...");

            const resB = await fetch(urlB);
            const dataB = await resB.json();

            if (resB.status === 200 && dataB.results) {
                console.log("¡ÉXITO PRO! ✅");
                console.log("Fuente: Polygon (Aggregates)");
                console.log("Precio Reciente:", dataB.results[0].c);
                console.log("Sello recomendado: 'En Vivo • Polygon'");
            } else {
                console.log("Fallo total en Polygon. Revisar API Key ❌");
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testNVDA();
