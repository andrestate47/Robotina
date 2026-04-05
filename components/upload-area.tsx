"use client"

import React, { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, X, BarChart3, AlertTriangle, CheckCircle2, Search, Coins, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

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
  datos_mercado?: {
    symbol: string
    price: number
    change24h: number
    high24h?: number
    low24h?: number
    source: string
  }
  es_historico?: boolean
  warnings?: string[]
}

interface UploadAreaProps {
  onAnalysisCompleted?: () => void;
  analysisRemaining: number;
}

const getCurrencySymbol = (sym: string | undefined): string => {
  if (!sym) return "$";
  const s = sym.toUpperCase();
  if (s.includes(".MC") || s.includes("EUR") || s.includes("IBEX") || s.includes("DAX") || s.includes("GER40") || s.includes(".MA")) return "€";
  if (s.includes("GBP") || s.includes("FTSE") || s.includes("UK100") || s.includes(".L")) return "£";
  if (s.includes("JPY")) return "¥";
  return "$";
}

const formatPrice = (price: number | string | undefined, symbol?: string): string => {
  if (price === undefined || price === null || isNaN(Number(price))) return "N/A";
  const numPrice = Number(price);
  let decimals = 2;

  if (numPrice < 5) decimals = 4;
  else if (symbol && (symbol.toUpperCase().includes(".MC") || symbol.toUpperCase().includes("EUR") || symbol.toUpperCase().includes("IBEX") || symbol.toUpperCase().includes("DAX"))) {
    decimals = 3;
  }

  return numPrice.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function UploadArea({ onAnalysisCompleted, analysisRemaining }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [symbol, setSymbol] = useState("")
  const [tradingStyle, setTradingStyle] = useState("intraday")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) {
        const file = e.clipboardData.files[0]
        if (file && file.type.startsWith("image/")) {
          e.preventDefault()
          const reader = new FileReader()
          reader.onload = (e) => setUploadedImage(e.target?.result as string)
          reader.readAsDataURL(file)
        }
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  const saveToHistory = async (parsed: any) => {
    try {
      localStorage.setItem("lastAnalysisResult", JSON.stringify(parsed));
      localStorage.setItem("lastAnalysisVote", ""); 

      const currentCount = parseInt(localStorage.getItem("analysisCount") || "0");
      localStorage.setItem("analysisCount", (currentCount + 1).toString());

      const historyRaw = localStorage.getItem("analysisHistory")
      let history = historyRaw ? JSON.parse(historyRaw) : []
      history.unshift({ ...parsed, timestamp: Date.now() })
      if (history.length > 4) history = history.slice(0, 4)
      localStorage.setItem("analysisHistory", JSON.stringify(history))

      if (parsed.tipo_analisis === "LONG") {
        const longs = parseInt(localStorage.getItem("analysisLongs") || "0");
        localStorage.setItem("analysisLongs", (longs + 1).toString());
      } else if (parsed.tipo_analisis === "SHORT") {
        const shorts = parseInt(localStorage.getItem("analysisShorts") || "0");
        localStorage.setItem("analysisShorts", (shorts + 1).toString());
      }

      // --- 5. ACTUALIZACIÓN REAL EN SUPABASE ---
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // PERFIL DEV: email del usuario o admin detectado
        const isDev = session.user.email === "andresfuigueroaz@gmail.com" || session.user.email?.includes("admin");
        
        if (!isDev) {
          const newRemaining = Math.max(0, analysisRemaining - 1);
          await supabase
            .from("perfiles")
            .update({ analisis_restantes: newRemaining })
            .eq("id", session.user.id);
          
          if (onAnalysisCompleted) onAnalysisCompleted();
        } else {
          console.log("Perfil Dev detectado: Bypass de créditos.");
          if (onAnalysisCompleted) onAnalysisCompleted();
        }
      }
    } catch (e) {
      console.warn("No se pudo guardar historial o actualizar Supabase", e)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)
    setStatusMessage(null)
    setAnalysisResult(null)
    setUserVote(null)

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: uploadedImage, symbol, tradingStyle }),
      })
      const data = await response.json()
      let parsed: AnalysisResult = data
      
      if (typeof data === "string" && data.includes("{")) {
        try { parsed = JSON.parse(data.match(/{[\s\S]*}/)?.[0] || "{}") } catch { parsed = { comentario: "Error JSON" } }
      }

      if (parsed.error) {
        setStatusMessage(parsed.error === "UNKNOWN_SYMBOL" ? "Activo no identificado" : parsed.error || "Error al analizar")
      } else {
        setAnalysisResult(parsed)
        await saveToHistory(parsed)
        window.dispatchEvent(new Event("newAnalysisSaved"))
      }
    } catch (error) {
      setStatusMessage("Error al procesar la imagen")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemove = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
    setStatusMessage(null)
    setUserVote(null)
  }

  const handleSelectClick = () => fileInputRef.current?.click()

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-border shadow-lg">
      <div className="absolute inset-0 bg-[#07070a]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8">
        {!analysisResult && (
          <div className="mb-6 max-w-[280px] mx-auto space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold uppercase tracking-wider">Activo (Opcional)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Ej. BTC, AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["scalping", "intraday", "swing"].map((style) => (
                <button
                  key={style}
                  onClick={() => setTradingStyle(style)}
                  className={cn(
                    "py-2 rounded-lg text-[10px] font-bold uppercase border transition-all",
                    tradingStyle === style ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}

        <div 
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all",
            isDragging ? "border-purple-500 bg-purple-500/5 scale-[1.01]" : "border-white/10 bg-white/[0.02]",
            uploadedImage ? "p-2 sm:p-4" : "p-8 sm:p-12 text-center"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Analiza tu Gráfico</h3>
                <p className="text-sm text-slate-400 mb-6">Pega una imagen o haz clic para subir</p>
                <Button onClick={handleSelectClick} className="bg-purple-600 hover:bg-purple-500">
                  <ImageIcon className="w-4 h-4 mr-2" /> Seleccionar
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImage} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                  {!analysisResult && (
                    <button onClick={handleRemove} className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!analysisResult ? (
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-6 text-lg font-bold">
                    {isAnalyzing ? "Analizando Gráfico..." : "Confirmar y Analizar"}
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Resultados */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                       <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                         <Search className="w-4 h-4 text-purple-400" /> Diagnóstico IA
                       </h4>
                       <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          En Vivo • {analysisResult.datos_mercado?.symbol || "Captura"}
                       </Badge>
                    </div>

                    {analysisResult.datos_mercado && (
                      <div className="bg-slate-950 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg"><Coins className="w-5 h-5 text-indigo-400" /></div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">{analysisResult.datos_mercado.symbol}</p>
                            <p className="text-xl font-black text-white">
                              {getCurrencySymbol(analysisResult.datos_mercado.symbol)}{formatPrice(analysisResult.datos_mercado.price, analysisResult.datos_mercado.symbol)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tipo</p>
                          <p className={cn("text-sm font-black", analysisResult.tipo_analisis === "LONG" ? "text-emerald-400" : "text-rose-400")}>
                            {analysisResult.tipo_analisis || "—"}
                          </p>
                       </div>
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Riesgo</p>
                          <p className={cn("text-sm font-bold", 
                            analysisResult.nivelRiesgo?.includes("Bajo") ? "text-emerald-400" : 
                            analysisResult.nivelRiesgo?.includes("Alto") ? "text-rose-400" : "text-amber-400"
                          )}>
                            {analysisResult.nivelRiesgo || "Moderado"}
                          </p>
                       </div>
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Confianza</p>
                          <p className="text-sm font-bold text-indigo-400">{analysisResult.confianza || "85%"}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950/50 border border-white/5 p-3 rounded-xl">
                       <div className="text-center">
                          <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Entrada</p>
                          <p className="text-xs font-black text-white">{analysisResult.entrada || "—"}</p>
                       </div>
                       <div className="text-center border-x border-white/5">
                          <p className="text-[9px] text-emerald-500/80 font-bold uppercase mb-0.5">Target</p>
                          <p className="text-xs font-black text-emerald-400">{analysisResult.salida || "—"}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] text-rose-500/80 font-bold uppercase mb-0.5">S. Loss</p>
                          <p className="text-xs font-black text-rose-400">{analysisResult.stop_loss || "—"}</p>
                       </div>
                    </div>

                    {analysisResult.indicadores_clave && analysisResult.indicadores_clave.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.indicadores_clave.map((tag, i) => (
                          <span key={i} className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {analysisResult.comentario && (
                      <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl">
                        <p className="text-[10px] text-purple-400 font-bold uppercase mb-2">Análisis Detallado</p>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{analysisResult.comentario}"</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5 mt-6">
                       <Button onClick={handleRemove} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                         Entendido, Cerrar
                       </Button>
                       <div className="flex items-center gap-3 bg-white/5 px-4 rounded-xl border border-white/10 justify-center">
                          <span className="text-[10px] font-bold text-slate-500">¿ÚTIL?</span>
                          <button onClick={() => setUserVote("up")} className={cn("p-2 transition-all", userVote === "up" ? "text-emerald-400" : "text-slate-500")}><ThumbsUp className="w-5 h-5" /></button>
                          <button onClick={() => setUserVote("down")} className={cn("p-2 transition-all", userVote === "down" ? "text-rose-400" : "text-slate-500")}><ThumbsDown className="w-5 h-5" /></button>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
