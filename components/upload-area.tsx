"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, X, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnalysisResult {
  rendimiento?: string
  valorTotal?: string
  nivelRiesgo?: string
  diversificacion?: string
  volatilidad?: string
  beta?: string
  ratioSharpe?: string
  comentario?: string
  error?: string
  patron_detectado?: string
  tipo_analisis?: string
  confianza?: string
  entrada?: string
  salida?: string
  stop_loss?: string
  indicadores_clave?: string[]
}

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🧲 Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  // 📂 Input manual
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  // 🚀 Enviar imagen al backend
  const handleAnalyze = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)
    setStatusMessage(null)
    setAnalysisResult(null)

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: uploadedImage }),
      })

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`)

      const data = await response.json()
      console.log("✅ Resultado del análisis:", data)

      let parsed: AnalysisResult = data
      if (typeof data === "string" && data.includes("{")) {
        try {
          parsed = JSON.parse(data.match(/{[\s\S]*}/)?.[0] || "{}")
        } catch {
          parsed = { comentario: "No se pudo interpretar el JSON del modelo." }
        }
      }

      if (parsed.error) setStatusMessage(`❌ ${parsed.error}`)
      else if (parsed.comentario) setStatusMessage(`⚠️ ${parsed.comentario}`)
      else setStatusMessage("✅ Análisis completado con éxito.")

      setAnalysisResult(parsed)
    } catch (error) {
      console.error("❌ Error analizando la imagen:", error)
      setStatusMessage("Error inesperado al procesar la imagen.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemove = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
    setStatusMessage(null)
  }

  const handleSelectClick = () => fileInputRef.current?.click()

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-border shadow-lg">

  {/* Fondo con imagen */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/images/bg-trading.png')" }}
  ></div>

  {/* Overlay suave */}
  <div className="absolute inset-0 bg-slate-100/80"></div>

  {/* Contenido */}
  <div className="relative z-10 p-6 sm:p-8 md:p-1 rounded-2xl bg-[#0B2239]">
    {/* tu contenido */}
  </div>


      {/* Contenido principal con blur suave */}
         <div className="relative z-10 p-6 sm:p-8 md:p-1  rounded-2xl bg-[#081A2D]">
          <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
            uploadedImage ? "p-3 sm:p-4" : "p-6 sm:p-8 md:p-12"
          )}
        >
          {!uploadedImage ? (
            // 🟢 Estado inicial
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Sube tu captura de inversión</h3>
              <p className="text-base text-muted-orange mb-6 max-w-md mx-auto">
                Arrastra una imagen o haz clic para seleccionarla
              </p>
              <Button size="lg" onClick={handleSelectClick}>
                <ImageIcon className="w-5 h-5 mr-2" /> Seleccionar imagen
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <p className="text-xs text-primary mt-4">Formatos soportados: JPG, PNG, WebP (máx. 10MB)</p>
            </div>
          ) : (
            // 🟠 Imagen subida
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={uploadedImage}
                  alt="Captura de inversión"
                  className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-500"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" /> Analizar inversión
                    </>
                  )}
                </Button>
              </div>

              {/* 📡 Estado del análisis */}
              

              {/* 🟢 Resultados */}
              {analysisResult && !analysisResult.error && (
                <motion.div
                  className="mt-6 p-6 rounded-xl bg-muted/40 border border-border space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">📊 Lector de Gráficas</h3>

                  {/* Patrón detectado */}
                  <div className="bg-card/60 border p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground">📉 Patrón detectado</p>
                    <p className="text-lg font-semibold text-foreground">
                      {analysisResult.patron_detectado || "—"}
                    </p>
                  </div>

                  {/* Tipo de análisis y confianza */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-card/60 border p-4 rounded-xl text-center">
                      <p className="text-sm text-muted-foreground mb-1">📊 Tipo de análisis</p>
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          analysisResult.tipo_analisis === "LONG"
                            ? "text-green-600"
                            : analysisResult.tipo_analisis === "SHORT"
                            ? "text-red-600"
                            : "text-foreground"
                        )}
                      >
                        {analysisResult.tipo_analisis || "—"}
                      </p>
                    </div>

                    <div className="bg-card/60 border p-4 rounded-xl text-center">
                      <p className="text-sm text-muted-foreground mb-1">🎯 Confianza</p>
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          analysisResult.confianza === "Alta"
                            ? "text-green-600"
                            : analysisResult.confianza === "Media"
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {analysisResult.confianza || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Entrada / Salida / Stop Loss */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 text-green-800 rounded-xl p-4 text-center shadow-sm">
                      <p className="font-medium">🎯 Entrada</p>
                      <p className="text-xl font-bold">{analysisResult.entrada ?? "—"}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-800 rounded-xl p-4 text-center shadow-sm">
                      <p className="font-medium">💵 Salida</p>
                      <p className="text-xl font-bold">{analysisResult.salida ?? "—"}</p>
                    </div>
                    <div className="bg-red-50 text-red-800 rounded-xl p-4 text-center shadow-sm">
                      <p className="font-medium">🛑 Stop Loss</p>
                      <p className="text-xl font-bold">{analysisResult.stop_loss ?? "—"}</p>
                    </div>
                  </div>

                  {/* Indicadores clave */}
                  <div className="bg-card border p-4 rounded-xl space-y-3">
                    <p className="text-sm text-muted-foreground">🧩 Indicadores clave</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(analysisResult.indicadores_clave) &&
                      analysisResult.indicadores_clave.length > 0 ? (
                        analysisResult.indicadores_clave.map((ind, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                          >
                            {ind}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">Sin indicadores detectados</p>
                      )}
                    </div>
                  </div>

                  {/* Comentario */}
                  {analysisResult.comentario && (
                    <div className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">💬 Comentario del analista</p>
                      <p className="text-foreground leading-relaxed">{analysisResult.comentario}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
