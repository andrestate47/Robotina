
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { vote, symbol, priceResult } = await req.json()

        // 1. Validar datos mínimos
        if (!vote) {
            return NextResponse.json({ error: "Falta el voto" }, { status: 400 })
        }

        console.log(`🗳️ Nuevo voto recibido: ${vote.toUpperCase()} para ${symbol || "Desconocido"}`)

        const googleSheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
        if (googleSheetUrl) {
            try {
                const payload = {
                    date: new Date().toLocaleString("es-ES", { timeZone: "America/New_York" }),
                    vote: vote.toUpperCase(),
                    symbol: symbol || "N/A",
                    price: priceResult || "N/A",
                    comment: "Voto desde Robotina Web"
                };

                console.log("📤 Enviando a Google Sheets:", payload);

                const response = await fetch(googleSheetUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    redirect: "follow" // CRÍTICO para Google Apps Script
                });

                console.log(`📡 Google Sheets Response Status: ${response.status}`);
                if (response.ok) {
                    console.log("✅ Voto guardado exitosamente en Google Sheets");
                } else {
                    const errorText = await response.text();
                    console.error("❌ Google Sheets respondió con error:", errorText);
                }
            } catch (sheetError) {
                console.error("❌ Error crítico enviando a Google Sheets:", sheetError);
            }
        } else {
            console.warn("⚠️ GOOGLE_SHEETS_WEBHOOK_URL no configurada.");
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("❌ Error en /api/save-feedback:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
