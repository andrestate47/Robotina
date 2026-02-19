
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { vote, symbol, priceResult } = await req.json()

        // 1. Validar datos mínimos
        if (!vote) {
            return NextResponse.json({ error: "Falta el voto" }, { status: 400 })
        }

        console.log(`🗳️ Nuevo voto recibido: ${vote.toUpperCase()} para ${symbol || "Desconocido"}`)

        // 2. Enviar a Google Sheets (Si hay URL configurada)
        const googleSheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

        if (googleSheetUrl) {
            try {
                await fetch(googleSheetUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        vote,
                        symbol: symbol || "N/A",
                        price: priceResult || "N/A",
                        comment: "Voto desde web"
                    }),
                })
                console.log("✅ Voto enviado a Google Sheets")
            } catch (sheetError) {
                console.error("❌ Error enviando a Google Sheets:", sheetError)
                // No fallamos la request principal, solo logueamos el error
            }
        } else {
            console.warn("⚠️ GOOGLE_SHEETS_WEBHOOK_URL no configurada en .env. El voto no se guardó en Excel.")
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("❌ Error en /api/save-feedback:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
