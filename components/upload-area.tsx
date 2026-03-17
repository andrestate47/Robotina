"use client"

import React, { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, X, BarChart3, AlertTriangle, CheckCircle2, Search, Coins, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

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

const POPULAR_ASSETS = [
  { symbol: "SPY", name: "S&P 500 (ETF)", category: "Índice" },
  { symbol: "QQQ", name: "Nasdaq 100", category: "Índice" },
  { symbol: "DIA", name: "Dow Jones 30", category: "Índice" },
  { symbol: "US30", name: "Wall Street 30", category: "Índice" },
  { symbol: "GER40", name: "DAX 40 (Alemania)", category: "Índice" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "Acción" },
  { symbol: "NVDA", name: "Nvidia Corp.", category: "Acción" },
  { symbol: "AAPL", name: "Apple Inc.", category: "Acción" },
  { symbol: "MSFT", name: "Microsoft", category: "Acción" },
  { symbol: "AMZN", name: "Amazon", category: "Acción" },
  { symbol: "GOOGL", name: "Google", category: "Acción" },
  { symbol: "META", name: "Meta (Facebook)", category: "Acción" },
  { symbol: "NFLX", name: "Netflix", category: "Acción" },
  { symbol: "XAUUSD", name: "Oro (Gold)", category: "Commodity" },
  { symbol: "WTI", name: "Petróleo (Crudo)", category: "Commodity" },
  { symbol: "EURUSD", name: "Euro / Dólar", category: "Forex" },
  { symbol: "GBPUSD", name: "Libra / Dólar", category: "Forex" },
  { symbol: "USDJPY", name: "Dólar / Yen", category: "Forex" },
  { symbol: "BTC", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH", name: "Ethereum", category: "Crypto" },
  { symbol: "SOL", name: "Solana", category: "Crypto" },
]

export function UploadArea() {
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

  const saveToHistory = (parsed: any) => {
    try {
      // 1. Guardar como último análisis (Widget Lateral)
      localStorage.setItem("lastAnalysisResult", JSON.stringify(parsed));
      localStorage.setItem("lastAnalysisVote", ""); // Reset voto

      // 2. Actualizar contador total
      const currentCount = parseInt(localStorage.getItem("analysisCount") || "0");
      localStorage.setItem("analysisCount", (currentCount + 1).toString());

      // 3. Guardar en historial de sesión (Lista Lateral)
      const historyRaw = localStorage.getItem("analysisHistory")
      let history = historyRaw ? JSON.parse(historyRaw) : []
      history.unshift({ ...parsed, timestamp: Date.now() })
      if (history.length > 4) history = history.slice(0, 4)
      localStorage.setItem("analysisHistory", JSON.stringify(history))

      // 4. Actualizar estadísticas (Longs/Shorts)
      if (parsed.tipo_analisis === "LONG") {
        const longs = parseInt(localStorage.getItem("analysisLongs") || "0");
        localStorage.setItem("analysisLongs", (longs + 1).toString());
      } else if (parsed.tipo_analisis === "SHORT") {
        const shorts = parseInt(localStorage.getItem("analysisShorts") || "0");
        localStorage.setItem("analysisShorts", (shorts + 1).toString());
      }
    } catch (e) {
      console.warn("No se pudo guardar historial", e)
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
        setStatusMessage(parsed.error === "UNKNOWN_SYMBOL" ? "Activo no identificado" : parsed.error)
      } else {
        setAnalysisResult(parsed)
        saveToHistory(parsed)
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
                    
                    {/* 🚨 ALERTAS DEL SISTEMA */}
                    {(analysisResult.es_historico || (analysisResult.warnings && analysisResult.warnings.length > 0)) && (
                      <div className="border border-yellow-500/50 bg-yellow-900/40 backdrop-blur-sm rounded-xl p-3 mb-2">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-yellow-50">
                            {analysisResult.es_historico && (
                              <p className="font-bold text-yellow-300 mb-1">Modo Análisis Histórico</p>
                            )}
                            {analysisResult.warnings?.map((w, idx) => (
                              <p key={idx}>• {w}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

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
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end p-2 bg-white/5 rounded-lg border border-white/5">
                           <p className="text-[10px] text-slate-500 uppercase font-bold">Día</p>
                           <div className="flex gap-3 text-[11px] font-bold">
                             <span className="text-emerald-400">H: {formatPrice(analysisResult.datos_mercado.high24h, analysisResult.datos_mercado.symbol)}</span>
                             <span className="text-rose-400">L: {formatPrice(analysisResult.datos_mercado.low24h, analysisResult.datos_mercado.symbol)}</span>
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Patrón</p>
                          <p className="text-sm font-bold text-white truncate">{analysisResult.patron_detectado || "—"}</p>
                       </div>
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tipo</p>
                          <p className={cn("text-sm font-black", analysisResult.tipo_analisis === "LONG" ? "text-emerald-400" : "text-rose-400")}>
                            {analysisResult.tipo_analisis || "—"}
                          </p>
                       </div>
                       <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Confianza</p>
                          <p className="text-sm font-black text-white">{analysisResult.confianza || "—"}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl text-center">
                          <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Precio Entrada</p>
                          <p className="text-2xl font-black text-white">
                            {analysisResult.entrada ? `${getCurrencySymbol(analysisResult.datos_mercado?.symbol)}${formatPrice(analysisResult.entrada, analysisResult.datos_mercado?.symbol)}` : "—"}
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-xl text-center flex flex-col justify-center">
                            <p className="text-[9px] text-emerald-400 font-bold uppercase">Objetivo</p>
                            <p className="text-sm font-black text-white">{analysisResult.salida ? formatPrice(analysisResult.salida, analysisResult.datos_mercado?.symbol) : "—"}</p>
                          </div>
                          <div className="bg-rose-600/10 border border-rose-500/20 p-3 rounded-xl text-center flex flex-col justify-center">
                            <p className="text-[9px] text-rose-400 font-bold uppercase">Stop Loss</p>
                            <p className="text-sm font-black text-white">{analysisResult.stop_loss ? formatPrice(analysisResult.stop_loss, analysisResult.datos_mercado?.symbol) : "—"}</p>
                          </div>
                       </div>
                    </div>

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
