"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { UploadArea } from "@/components/upload-area"
import { AnalysisResults } from "@/components/analysis-results"
import { BorderBeam } from "@/components/magicui/border-beam"
import {
  TrendingUp,
  BarChart3,
  Shield,
  LogOut,
  LayoutDashboard,
  History,
  Settings,
  Bell,
  Search,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Headset,
  Scan,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  CreditCard,
  Star,
  ArrowRight
} from "lucide-react"

// --- COMPONENTE LOGOS DE ACTIVOS PÚBLICOS ---
const AssetIcon = ({ symbol }: { symbol?: string }) => {
  const clean = (symbol || "X").toUpperCase().replace("/", "");
  const [imgFailed, setImgFailed] = useState(false);

  // Mapeo Dominios Corporativos (Logo en APIs libres como Clearbit)
  const domainMap: Record<string, string> = {
    'TSLA': 'tesla.com',
    'NVDA': 'nvidia.com',
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'GOOGL': 'google.com',
    'META': 'meta.com',
    'NFLX': 'netflix.com',
    'REP.MC': 'repsol.com',
    'AMD': 'amd.com',
  };

  // Mapeo de Criptomonedas (Logos de Cryptologos Network de alta calidad)
  const cryptoMap: Record<string, string> = {
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
    'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
    'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  };

  if (!imgFailed) {
    if (cryptoMap[clean]) {
      return <img src={cryptoMap[clean]} alt={clean} onError={() => setImgFailed(true)} className="w-[60%] h-[60%] object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />;
    }
    if (domainMap[clean]) {
      return (
        <div className="w-full h-full bg-white flex items-center justify-center p-2 border border-white/10">
          <img src={`https://logo.clearbit.com/${domainMap[clean]}`} alt={clean} onError={() => setImgFailed(true)} className="w-full h-full object-contain" />
        </div>
      );
    }
  }

  // Fallbacks: Emojis o Letras Generadas
  if (['XAUUSD', 'GOLD'].includes(clean)) return <span className="text-xl drop-shadow-lg">🥇</span>;
  if (['XAGUSD', 'SILVER'].includes(clean)) return <span className="text-xl drop-shadow-lg">🥈</span>;
  if (['USOIL', 'WTI'].includes(clean)) return <span className="text-xl drop-shadow-lg">🛢️</span>;
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'].includes(clean)) return <span className="text-xl drop-shadow-lg">💱</span>;
  if (['SPX', 'NAS100', 'US30', 'IBEX35', 'DAX'].includes(clean)) return <span className="text-xl drop-shadow-lg">📈</span>;

  return <div className="text-sm font-black text-slate-300 uppercase">{clean.substring(0, 2)}</div>;
}

// NUEVO: Mini grid animado simulando mercado en vivo para la 4ta Card
const LiveMiniChartGrid = () => {
  const [prices, setPrices] = useState({
    NVDA: 135.45,
    BTC: 94235.10,
    EURUSD: 1.0824,
    SPX: 5980.11
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        NVDA: prev.NVDA + (Math.random() - 0.5) * 0.5,
        BTC: prev.BTC + (Math.random() - 0.5) * 50,
        EURUSD: prev.EURUSD + (Math.random() - 0.5) * 0.0005,
        SPX: prev.SPX + (Math.random() - 0.5) * 2
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, decimals: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const assets = [
    { symbol: "NVDA", price: formatPrice(prices.NVDA, 2), color: Math.random() > 0.5 ? "text-emerald-400" : "text-rose-400" },
    { symbol: "BTC", price: formatPrice(prices.BTC, 2), color: Math.random() > 0.5 ? "text-emerald-400" : "text-rose-400" },
    { symbol: "EUR/USD", price: formatPrice(prices.EURUSD, 4), color: Math.random() > 0.5 ? "text-emerald-400" : "text-rose-400" },
    { symbol: "S&P500", price: formatPrice(prices.SPX, 2), color: Math.random() > 0.5 ? "text-emerald-400" : "text-rose-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 h-full w-full">
      {assets.map((a, i) => (
        <div key={i} className="bg-white/5 rounded-lg p-2.5 flex flex-col justify-center relative overflow-hidden group hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 mb-0.5">{a.symbol}</span>
          <span className={`text-[11px] font-mono font-bold tracking-tight ${a.color} transition-colors duration-300`}>
            {a.price}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Cargando...");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [lastAnalysisVote, setLastAnalysisVote] = useState<"up" | "down" | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [stats, setStats] = useState({ longs: 0, shorts: 0, upvotes: 0, downvotes: 0 });
  const [isCatAnimating, setIsCatAnimating] = useState(false);

  // Computa si debemos mostrar el texto dependiendo del dispositivo
  const showSidebarText = isSidebarOpen || isMobileMenuOpen;

  useEffect(() => {
    // Verificamos si el usuario se autenticó previamente
    const isAuth = localStorage.getItem("investAnalyzerAuth");
    if (isAuth !== "true") {
      router.push("/login"); // Si no está autenticado, lo echamos al login
    } else {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem("investAnalyzerUser");
      setUserName(storedUser || "admin");

      const loadLastData = () => {
        try {
          const savedResult = localStorage.getItem("lastAnalysisResult");
          const savedVote = localStorage.getItem("lastAnalysisVote");
          const savedHistory = localStorage.getItem("analysisHistory");
          const savedCount = localStorage.getItem("analysisCount");

          if (savedResult) {
            setLastAnalysis(JSON.parse(savedResult));
          } else {
            setLastAnalysis(null);
          }
          if (savedVote) {
            setLastAnalysisVote(savedVote as "up" | "down");
          } else {
            setLastAnalysisVote(null);
          }
          if (savedHistory) {
            setAnalysisHistory(JSON.parse(savedHistory));
          } else {
            setAnalysisHistory([]);
          }
          if (savedCount) {
            setAnalysisCount(parseInt(savedCount));
          }

          setStats({
            longs: parseInt(localStorage.getItem("analysisLongs") || "0"),
            shorts: parseInt(localStorage.getItem("analysisShorts") || "0"),
            upvotes: parseInt(localStorage.getItem("analysisUpvotes") || "0"),
            downvotes: parseInt(localStorage.getItem("analysisDownvotes") || "0"),
          });
        } catch (e) { }
      };

      loadLastData();

      // Escuchar eventos desde UploadArea para actualizar en tiempo real
      window.addEventListener("newAnalysisSaved", loadLastData);
      return () => window.removeEventListener("newAnalysisSaved", loadLastData);
    }
  }, [router]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogoutAction = () => {
    localStorage.removeItem("investAnalyzerAuth");
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  // --- Compute Real Stats ---
  const totalDominance = stats.longs + stats.shorts;
  const longPercent = totalDominance > 0 ? Math.round((stats.longs / totalDominance) * 100) : 0;
  const shortPercent = totalDominance > 0 ? Math.round((stats.shorts / totalDominance) * 100) : 0;

  let dominantLabel = "Neutral";
  let dominantValue = "0%";
  let dominantColorClass = "text-slate-400 bg-slate-400/10";
  let dominantTextColor = "text-white";

  if (totalDominance > 0) {
    if (longPercent >= shortPercent) {
      dominantLabel = "Sesgo Alcista (LONG)";
      dominantValue = `${longPercent}%`;
      dominantColorClass = "text-emerald-400 bg-emerald-400/10";
      dominantTextColor = "text-emerald-400";
    } else {
      dominantLabel = "Sesgo Bajista (SHORT)";
      dominantValue = `${shortPercent}%`;
      dominantColorClass = "text-rose-400 bg-rose-400/10";
      dominantTextColor = "text-rose-400";
    }
  }

  const totalVotes = stats.upvotes + stats.downvotes;
  const accuracyScore = totalVotes > 0 ? Math.round((stats.upvotes / totalVotes) * 100) : 0;

  return (
    <div className="flex h-screen bg-[#07070a] text-slate-200 font-sans overflow-hidden">

      {/* --- Overlay para Móvil --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[50] backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Sidebar Estilo Wope --- */}
      <aside className={`border-r border-white/5 bg-[#0a0a0f] flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-[60] 
        ${isMobileMenuOpen ? 'flex fixed h-full w-64 left-0 top-0 shadow-2xl' : 'hidden md:flex relative'} 
        ${isSidebarOpen && !isMobileMenuOpen ? 'md:w-64' : 'md:w-12'}`}>
        <div className="overflow-hidden">
          <div className={`h-16 flex items-center border-b border-white/5 ${showSidebarText ? "justify-between px-6" : "justify-center"}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] overflow-hidden">
                <Image
                  src="/robot-cat.png"
                  alt="Logo Gato Robot"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <h1 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 transition-opacity duration-300 whitespace-nowrap capitalize ${showSidebarText ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
                {userName}
              </h1>
            </div>
            {/* Botón Cerrar en móvil */}
            {isMobileMenuOpen && (
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
            {/* Botón Cerrar (Contraer) en Desktop */}
            {!isMobileMenuOpen && isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(false)} className="hidden md:block text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className={`space-y-1 mt-4 ${showSidebarText ? "p-4" : "p-2"}`}>
            {showSidebarText && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-all whitespace-nowrap">Principal</p>}

            <a href="#" className={`flex items-center gap-3 py-2.5 rounded-lg bg-purple-500/10 text-purple-400 font-medium transition-colors border border-purple-500/20 whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}>
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {showSidebarText && <span>Panel de Control</span>}
            </a>
            <a href="#" className={`flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}>
              <History className="w-5 h-5 shrink-0" />
              {showSidebarText && <span>Historial de Análisis</span>}
            </a>
            <a href="#" className={`flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}>
              <BarChart3 className="w-5 h-5 shrink-0" />
              {showSidebarText && <span>Métricas y Rendimiento</span>}
            </a>
            <Link href="/pricing" className={`flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}>
              <CreditCard className="w-5 h-5 shrink-0" />
              {showSidebarText && <span>Planes y Precios</span>}
            </Link>
          </div>
        </div>

        <div className={`border-t border-white/5 flex flex-col gap-1 mb-2 ${showSidebarText ? "p-4" : "p-2"}`}>
          <a href="#" className={`flex items-center gap-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}>
            <Settings className="w-5 h-5 shrink-0" />
            {showSidebarText && <span>Configuración</span>}
          </a>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {showSidebarText && <span>Cerrar Sesión</span>}
          </button>

          {/* Botón de contraer menú (oculto en móvil) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden md:flex w-full items-center gap-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors mt-2 whitespace-nowrap ${showSidebarText ? "px-3" : "justify-center"}`}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
            {showSidebarText && <span>Contraer Menú</span>}
          </button>
        </div>
      </aside>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Glow de fondo para simular ambiente Wope */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
            <button
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 shrink-0" />
            </button>

            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Robo<span className="text-purple-500">tina</span>
            </h2>

            <a href="#" className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              <Headset className="w-4 h-4 shrink-0" />
              Contáctanos
            </a>

            <Link href="/pricing" className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm font-bold text-white bg-purple-600/20 hover:bg-purple-600/30 px-3 py-1.5 rounded-full border border-purple-500/20 transition-all shadow-lg shadow-purple-900/10">
              <CreditCard className="w-4 h-4 shrink-0 text-purple-400" />
              Planes
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/10 overflow-hidden flex items-center justify-center">
              <Image src="/robot-cat.png" width={32} height={32} alt="User" className="object-cover" />
            </div>
          </div>
        </header>

        {/* Workspace scrolleable */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 z-0 relative">

          <div className="max-w-6xl mx-auto space-y-8 relative">

            {/* --- Nuevo Hero Supahero Style --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full rounded-3xl overflow-hidden bg-[#111118]/80 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl"
            >
              {/* Luces y efectos de fondo del Hero */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Opcional: El rayo animado rodeando el Hero para extra lujo */}
              <BorderBeam size={400} duration={12} delay={9} colorFrom="#a855f7" colorTo="#3b82f6" />

              <div className="relative z-10 flex flex-col gap-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 space-y-5 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                      </span>
                      Sistema IA Activo y Listo
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight leading-tight">
                      Maximiza tu Rentabilidad <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                        Con Ventaja Algorítmica.
                      </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-xl">
                      Obtén la ventaja definitiva en el mercado. Robotina escanea instantáneamente tus gráficos para revelar patrones ocultos, confirmar tus entradas y ayudarte a operar con la precisión de un profesional.
                    </p>
                  </div>
                  {/* Flotante decorativo en el Hero */}
                  <div className="hidden md:flex flex-1 justify-center relative -translate-y-4">
                    <motion.div
                      onDoubleClick={() => {
                        if (!isCatAnimating) {
                          setIsCatAnimating(true);
                          setTimeout(() => setIsCatAnimating(false), 1200);
                        }
                      }}
                      animate={
                        isCatAnimating
                          ? { rotateY: 720, scale: 1.1 }
                          : { rotateY: 0, scale: 1 }
                      }
                      transition={
                        isCatAnimating
                          ? { duration: 1.2, ease: "easeInOut" }
                          : { duration: 0.3, ease: "easeInOut" }
                      }
                      className="relative w-64 h-64 cursor-pointer z-20 group"
                    >
                      {/* Burbuja "Power of AI" */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: isCatAnimating ? 1 : 0, scale: isCatAnimating ? 1 : 0.5, y: isCatAnimating ? -20 : 10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500/90 text-white text-xs font-black tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_purple] whitespace-nowrap pointer-events-none"
                      >
                        POWER OF AI ⚡
                      </motion.div>

                      <Image
                        src="/robot-cat.png"
                        alt="Gato IA Hero"
                        fill
                        className="object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] group-hover:drop-shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all duration-300"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Ticker 95% Ancho Centrado */}
                <div className="w-full md:w-[95%] mx-auto overflow-hidden relative border border-white/10 bg-white/5 rounded-xl py-3 flex backdrop-blur-sm shadow-xl">
                  {/* Sombras en los bordes para difuminar */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-[#111118] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-[#111118] to-transparent z-10 pointer-events-none" />

                  <motion.div
                    className="flex items-center gap-8 whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                  >
                    {[
                      { symbol: "BTC", price: "94,235.10", change: "+2.4%", up: true },
                      { symbol: "NVDA", price: "184.76", change: "+1.2%", up: true },
                      { symbol: "TSLA", price: "205.14", change: "-0.5%", up: false },
                      { symbol: "AAPL", price: "225.00", change: "+0.8%", up: true },
                      { symbol: "SPX", price: "5,980.11", change: "+0.3%", up: true },
                      { symbol: "GOLD", price: "2,650.40", change: "+0.1%", up: true },
                      { symbol: "ETH", price: "3,120.50", change: "-1.2%", up: false },
                      // Duplicados para efecto infinito sin saltos
                      { symbol: "BTC", price: "94,235.10", change: "+2.4%", up: true },
                      { symbol: "NVDA", price: "184.76", change: "+1.2%", up: true },
                      { symbol: "TSLA", price: "205.14", change: "-0.5%", up: false },
                      { symbol: "AAPL", price: "225.00", change: "+0.8%", up: true },
                      { symbol: "SPX", price: "5,980.11", change: "+0.3%", up: true },
                      { symbol: "GOLD", price: "2,650.40", change: "+0.1%", up: true },
                      { symbol: "ETH", price: "3,120.50", change: "-1.2%", up: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                        <span className="text-slate-400">{item.symbol}</span>
                        <span className="text-white">${item.price}</span>
                        <span className={item.up ? "text-emerald-400" : "text-rose-400"}>{item.change}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Llamado a la acción (CTA) debajo del Ticker */}
                <div className="flex justify-center mt-6">
                  <Link 
                    href="/pricing"
                    className="group relative flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-[1.05] transition-all shadow-xl hover:shadow-purple-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    <Star className="w-4 h-4 text-purple-600 animate-pulse" />
                    Ver Planes Premium
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            </motion.div>

            {/* Quick Stats (Bento Grid Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">+1 Nueva Actividad</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{analysisCount}</h3>
                <p className="text-sm text-slate-500">Análisis realizados este mes</p>
              </div>

              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dominantColorClass}`}>
                    {totalDominance} analizados
                  </span>
                </div>
                <h3 className={`text-3xl font-bold mb-1 ${dominantTextColor}`}>{dominantValue}</h3>
                <p className="text-sm text-slate-500">{dominantLabel}</p>
              </div>

              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                    {totalVotes} votos tuyos
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{totalVotes > 0 ? `${accuracyScore}%` : 'N/A'}</h3>
                <p className="text-sm text-slate-500">Satisfacción Global de la IA</p>
              </div>

              {/* Panel 4: Market Live Ticks */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    Live Data
                  </span>
                </div>
                <div className="flex-1 mt-1">
                  <LiveMiniChartGrid />
                </div>
              </div>
            </div>

            {/* Nuevo Analizador Wrapper Estilo Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Sección Upload Amplia */}
              <div className="lg:col-span-2 bg-[#09090d] border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                {/* Indicador de Status Neon */}
                <div className="absolute top-0 right-0 p-6 flex opacity-50">
                  <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Scan className="w-5 h-5 text-purple-400" />
                  Motor de Análisis Neuronal
                </h3>
                {/* Aquí inyectamos tu componente de subida original manteniendo su funcionalidad */}
                <div className="bg-[#0a0a0f] rounded-xl border border-white/5 overflow-hidden">
                  <UploadArea />
                </div>
              </div>

              {/* Tips/Info Lateral */}
              <div className="space-y-4">
                {/* Historial de últimos 4 análisis */}
                <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 relative z-10 flex items-center justify-between">
                    <span>Últimos Análisis</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{analysisHistory.length}/4 en sesión</span>
                  </h3>

                  <div className="space-y-2 relative z-10">
                    {analysisHistory.length > 0 ? (
                      analysisHistory.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all cursor-default">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                            <AssetIcon symbol={item.datos_mercado?.symbol || item.patron_detectado} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white uppercase truncate">{item.datos_mercado?.symbol || item.patron_detectado || "Activo"}</p>
                            <p className="text-[9px] text-slate-400 truncate">{item.patron_detectado || "Sin patrón"}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.tipo_analisis === "LONG" ? "text-emerald-400 bg-emerald-400/10" : item.tipo_analisis === "SHORT" ? "text-red-400 bg-red-400/10" : "text-blue-400 bg-blue-400/10"}`}>
                              {item.tipo_analisis === "LONG" ? "LONG" : item.tipo_analisis === "SHORT" ? "SHORT" : "NEUTRO"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-500 italic">
                        No has analizado ninguna gráfica aún.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 shadow-2xl">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Último Análisis detectado:</h4>
                  {lastAnalysis ? (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-purple-400 font-bold overflow-hidden shadow-inner">
                          <AssetIcon symbol={lastAnalysis.datos_mercado?.symbol || lastAnalysis.patron_detectado} />
                        </div>
                        <div className="flex flex-col flex-1">
                          <p className="text-sm font-bold text-white uppercase tracking-wider">{lastAnalysis.datos_mercado?.symbol || lastAnalysis.patron_detectado || "Activo"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${lastAnalysis.tipo_analisis === "LONG" ? "text-emerald-400 bg-emerald-400/10" : lastAnalysis.tipo_analisis === "SHORT" ? "text-red-400 bg-red-400/10" : "text-blue-400 bg-blue-400/10"}`}>
                              {lastAnalysis.tipo_analisis === "LONG" ? "ALCISTA" : lastAnalysis.tipo_analisis === "SHORT" ? "BAJISTA" : "ANALIZADO"}
                            </span>
                            <span className="text-[10px] text-slate-500 hidden sm:inline-block">• Local</span>
                          </div>
                        </div>
                      </div>

                      {/* Votación al extremo derecho */}
                      <div className="flex items-center shrink-0 ml-4 bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
                        {!lastAnalysisVote ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLastAnalysisVote("up");
                                localStorage.setItem("lastAnalysisVote", "up");
                                const currentUp = parseInt(localStorage.getItem("analysisUpvotes") || "0");
                                localStorage.setItem("analysisUpvotes", (currentUp + 1).toString());
                                window.dispatchEvent(new Event("newAnalysisSaved"));
                                fetch("https://script.google.com/macros/s/AKfycbxV04IAgtqn7317hMOx5Bqjs-BHGB7UjdGDNYDKHKoGkO2KLLzPEenK1_RtlfaCQEvi2A/exec", {
                                  method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    date: new Date().toLocaleString("es-ES", { timeZone: "America/New_York" }), vote: "UP",
                                    symbol: lastAnalysis?.datos_mercado?.symbol || "N/A", price: lastAnalysis?.entrada || "N/A", comment: "Voto Widget Lateral"
                                  })
                                });
                              }}
                              className="p-2 hover:bg-emerald-500/20 hover:text-emerald-400 text-white rounded-lg transition-all"
                              title="Buen análisis"
                            >
                              <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLastAnalysisVote("down");
                                localStorage.setItem("lastAnalysisVote", "down");
                                const currentDown = parseInt(localStorage.getItem("analysisDownvotes") || "0");
                                localStorage.setItem("analysisDownvotes", (currentDown + 1).toString());
                                window.dispatchEvent(new Event("newAnalysisSaved"));
                                fetch("https://script.google.com/macros/s/AKfycbxV04IAgtqn7317hMOx5Bqjs-BHGB7UjdGDNYDKHKoGkO2KLLzPEenK1_RtlfaCQEvi2A/exec", {
                                  method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    date: new Date().toLocaleString("es-ES", { timeZone: "America/New_York" }), vote: "DOWN",
                                    symbol: lastAnalysis?.datos_mercado?.symbol || "N/A", price: lastAnalysis?.entrada || "N/A", comment: "Voto Widget Lateral"
                                  })
                                });
                              }}
                              className="p-2 hover:bg-rose-500/20 hover:text-rose-400 text-white rounded-lg transition-all"
                              title="Mal análisis"
                            >
                              <ThumbsDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-emerald-400 flex items-center justify-center p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20" title={`Has votado ${lastAnalysisVote.toUpperCase()}`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-xs text-slate-500 italic font-medium">No hay análisis registrados</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Results Section */}
            <div className="bg-[#111118] border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Resultados del Informe</h3>
              <AnalysisResults />
            </div>

          </div>

          {/* --- Footer Completo --- */}
          <footer className="mt-20 border-t border-white/5 pt-12 pb-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-4">
              <div className="col-span-1 md:col-span-1 space-y-4">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Robo<span className="text-purple-500">tina</span>
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Empoderando el trading con IA de vanguardia. Analiza, decide y domina los mercados financieros.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-purple-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-blue-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-emerald-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-4">Plataforma</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="/" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
                  <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">Planes y Precios</Link></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Análisis de Mercado</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Comunidad VIP</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-4">Ayuda</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Soporte 24/7</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Documentación</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Términos de Uso</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Política de Privacidad</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white mb-4">Únete a Robotina</h4>
                <p className="text-xs text-slate-500">Suscríbete para recibir alertas de señales IA exclusivas.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Tu email" 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 flex-1"
                  />
                  <button className="bg-white text-black px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                    OK
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 px-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                © {new Date().getFullYear()} Robotina AI Ventures. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                <span>Estado: <span className="text-emerald-400">Excelente</span></span>
                <span className="hidden md:block">|</span>
                <span>Latencia: <span className="text-blue-400">12ms</span></span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* --- Modal de Cierre de Sesión (Wope Style) --- */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-[#07070a]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#111118] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <BorderBeam size={200} duration={8} colorFrom="#ef4444" colorTo="#a855f7" />
              
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white">¿Cerrar Sesión?</h3>
                <p className="text-slate-400 text-sm">
                  Estás a punto de salir del dashboard. Tendrás que volver a ingresar para ver tus métricas.
                </p>
                
                <div className="flex flex-col w-full gap-3 mt-4">
                  <button
                    onClick={confirmLogoutAction}
                    className="w-full py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Sí, cerrar sesión
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
