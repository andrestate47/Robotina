import { NextRequest, NextResponse } from "next/server"
import { getMarketData } from "@/lib/services/market"

export async function POST(req: NextRequest) {
  try {
    const { data, symbol, tradingStyle } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "No se envió ninguna imagen." }, { status: 400 })
    }

    console.log("📤 Imagen recibida del frontend:", data.slice(0, 80))

    // 🔍 Paso 1: Identificar Símbolo (Si el usuario no lo dio)
    let activeSymbol = symbol?.toUpperCase().trim()

    if (!activeSymbol) {
      console.log("🕵️‍♂️ Usuario no dio símbolo. Intentando detectar automáticamente con IA...")
      try {
        const detectionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-08-06",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Look at the text in the chart. Identify the financial asset. Return ONLY the standard Ticker Symbol.\n\nExamples:\n- If you see 'Nasdaq 100', 'US100', 'US Tech 100' -> Return 'NDX'\n- If you see 'Gold', 'XAU' -> Return 'GC=F'\n- If you see 'EURUSD', 'Euro' -> Return 'EURUSD'\n- If you see 'Bitcoin', 'BTC' -> Return 'BTC-USD'\n- If you see 'S&P 500', 'SPX' -> Return 'SPX'\n\nIf the image contains no clear text, infer from the context if possible, otherwise return 'UNKNOWN'. Return JUST the string." },
                  { type: "image_url", image_url: { url: data.startsWith("data:image") ? data : `data:image/png;base64,${data}` } },
                ],
              },
            ],
            max_tokens: 20,
          }),
        })
        const detectionResult = await detectionResponse.json()
        const detectedObj = detectionResult.choices?.[0]?.message?.content?.trim()

        if (detectedObj && detectedObj !== "UNKNOWN") {
          // Limpiar posibles puntos o texto extra
          activeSymbol = detectedObj.replace(/\.$/, "").trim()
          console.log(`🧠 IA detectó símbolo: ${activeSymbol}`)
        }
      } catch (e) {
        console.error("⚠️ Error detectando símbolo:", e)
      }
    }

    // 🔍 Paso 2: Obtener datos de mercado reales
    let marketInfoText = ""
    let marketData = null

    if (activeSymbol) {
      console.log(`🔎 Buscando datos para símbolo: ${activeSymbol}`)
      marketData = await getMarketData(activeSymbol)

      if (marketData) {
        marketInfoText = `
DATA DE MERCADO REAL (${marketData.source}) - REFERENCIA:
- Activo: ${marketData.symbol}
- Precio Actual: $${marketData.price}
- Cambio 24h: ${marketData.change24h}%
- Volumen: ${marketData.volume24h}

Usa estos datos como contexto adicional para validar tu análisis gráfico.
`
      }
    }

    console.log("📡 Enviando payload a OpenAI para análisis final...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-08-06",
        response_format: { type: "json_object" }, // Forzar JSON estricto
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en análisis técnico de gráficos financieros. Tu tarea es extraer información visual y proporcionar niveles técnicos de referencia basados puramente en la acción del precio observada. Responde siempre en formato JSON válido."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza la imagen adjunta. Identifica patrones técnicos y niveles clave.

${marketInfoText}

INSTRUCCIONES CLAVE:
1. Valida si el gráfico corresponde al activo identificado (${activeSymbol || "Desconocido"}).
2. Identifica la Tendencia Principal (Alcista, Bajista, Lateral) basándote en la acción del precio.
3. Localiza Soportes y Resistencias visibles.

FORMATO JSON REQUERIDO:
{
  "tipo_analisis": "LONG" | "SHORT" | "NEUTRO",
  "entrada": number (precio de entrada ideal basado en soporte/resistencia),
  "salida": number (objetivo técnico),
  "stop_loss": number (nivel de invalidación),
  "confianza": "Alta" | "Media" | "Baja",
  "patron_detectado": string (ej. "Doble Suelo", "Tendencia Alcista", "Canal Lateral"),
  "indicadores_clave": string[] (ej. ["RSI sobreventa", "Volumen creciente"]),
  "comentario": string (Breve explicación del análisis técnico)
}

Reglas:
- Si el precio de la imagen difiere del real provisto, usa el REAL como base para los niveles.
- Sé preciso con los números.
- IMPORTANTE: Si es un rango lateral claro, marca "NEUTRO". Si hay una dirección probable, usa "LONG" o "SHORT".
`
              },
              {
                type: "image_url",
                image_url: {
                  url: data.startsWith("data:image")
                    ? data
                    : `data:image/png;base64,${data}`,
                },
              },
            ],
          },
        ],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      const message = result?.error?.message || "Error al comunicarse con OpenAI"
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const content = result?.choices?.[0]?.message?.content || ""
    let parsedJSON: any = {}

    try {
      // Limpiar bloques de código Markdown si existen (```json ... ```)
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim()

      const match = cleanContent.match(/{[\s\S]*}/)
      if (match) {
        parsedJSON = JSON.parse(match[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch (err) {
      console.warn("⚠️ No se pudo parsear el JSON:", err)
      console.log("Raw Content:", content) // Debug
      parsedJSON = {
        patron_detectado: "Análisis no estructurado",
        comentario: content || "Error al interpretar la respuesta de la IA.",
        confianza: "Baja"
      }
    }

    // ✅ Corrección automática de tipo_analisis si falta
    if (!parsedJSON["tipo_analisis"] && parsedJSON["entrada"] && parsedJSON["salida"]) {
      parsedJSON["tipo_analisis"] =
        Number(parsedJSON["salida"]) > Number(parsedJSON["entrada"]) ? "LONG" : "SHORT"
    }

    // 🧬 Inyectar Market Data real en la respuesta final para mostrar en el frontend
    if (marketData) {
      parsedJSON["datos_mercado"] = marketData
    }

    return NextResponse.json(parsedJSON)
  } catch (error) {
    console.error("❌ Error en /api/analyze-image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "✅ Endpoint /api/analyze-image funcionando correctamente.",
  })
}
