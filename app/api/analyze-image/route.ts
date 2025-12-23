import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "No se envió ninguna imagen." }, { status: 400 })
    }

    console.log("📤 Imagen recibida del frontend:", data.slice(0, 80))
    console.log("📡 Enviando payload a OpenAI...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
              {
                type: "text",
                text: `Analiza cuidadosamente la imagen adjunta. Es un gráfico financiero (análisis técnico) que muestra posibles puntos de entrada, salida y stop loss.
Tu tarea es:

Interpretar los datos visuales del gráfico: tendencia, niveles clave, indicadores, patrones y volumen.

Generar una recomendación técnica en formato JSON con la siguiente estructura y campos exactos:

{
  "tipo_analisis": "LONG" | "SHORT",
  "entrada": 0.0,
  "salida": 0.0,
  "stop_loss": 0.0,
  "confianza": "Alta" | "Media" | "Baja",
  "patron_detectado": "Nombre del patrón o tendencia (ej. Doble suelo, Canal alcista, etc.)",
  "indicadores_clave": ["RSI", "MACD", "EMA 20", "Volumen", "..."],
  "comentario": "Resumen claro y profesional sobre la lectura del gráfico, la dirección de la tendencia, y el consejo operativo."
}

Sé extremadamente preciso con los niveles numéricos (entrada, salida, stop loss) y coherente con la dirección de la tendencia.

No inventes valores si no se pueden estimar con claridad; en ese caso, marca el campo con null.

Usa tono profesional, analítico y breve, como si fuera un informe para traders avanzados.

No agregues texto fuera del JSON.

Ejemplo de salida esperada:

{
  "tipo_analisis": "LONG",
  "entrada": 112.13,
  "salida": 116.09,
  "stop_loss": 111.40,
  "confianza": "Alta",
  "patron_detectado": "Tendencia alcista con soporte en EMA 50",
  "indicadores_clave": ["Volumen alto", "RSI > 60", "EMA 20 ascendente"],
  "comentario": "El gráfico muestra impulso alcista sostenido con volumen creciente. Se recomienda entrada moderada con gestión de riesgo ajustada."
}`,
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
    let parsedJSON = {}

    try {
      const match = content.match(/{[\s\S]*}/)
      if (match) parsedJSON = JSON.parse(match[0])
    } catch (err) {
      console.warn("⚠️ No se pudo parsear el JSON:", err)
      parsedJSON = { comentario: "No se pudo interpretar la respuesta del modelo." }
    }

    // ✅ Corrección automática de tipo_analisis si falta
    if (!parsedJSON["tipo_analisis"] && parsedJSON["entrada"] && parsedJSON["salida"]) {
      parsedJSON["tipo_analisis"] =
        Number(parsedJSON["salida"]) > Number(parsedJSON["entrada"]) ? "LONG" : "SHORT"
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
