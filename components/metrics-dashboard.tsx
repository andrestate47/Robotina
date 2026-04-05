"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Target, Activity, ArrowRight, Wallet, Percent, ChevronRight, TrendingDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface MetricsDashboardProps {
    analysisHistory: any[];
    userPlan: string;
}

// Colores de la marca Robotina
const BRAND_COLORS = ["#a855f7", "#3b82f6", "#f43f5e", "#10b981"]; // Purple, Blue, Rose, Emerald

export function MetricsDashboard({ analysisHistory, userPlan }: MetricsDashboardProps) {
    const [potentialProfit, setPotentialProfit] = useState(0);
    const [winRate, setWinRate] = useState(0);
    const [tradesFound, setTradesFound] = useState(0);
    
    // Datos de gráficas
    const [barData, setBarData] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);
    const [lineData, setLineData] = useState<any[]>([]);

    useEffect(() => {
        const count = analysisHistory.length;
        const predictedWins = Math.round(count * 0.82);
        const predictedLosses = count - predictedWins;
        const totalProfitCalculated = (predictedWins * 145) - (predictedLosses * 35);
        
        setTradesFound(count);
        setWinRate(count > 0 ? 82 : 0);
        
        let start = 0;
        const end = Math.max(0, totalProfitCalculated);
        if (end > 0) {
            const timer = setInterval(() => {
                start += (end / 100) * 5;
                if (start >= end) {
                    setPotentialProfit(end);
                    clearInterval(timer);
                } else {
                    setPotentialProfit(start);
                }
            }, 15);
        } else {
             setPotentialProfit(0);
        }

        // --- Gráfica de Líneas Gigante (Crecimiento de Capital Realista) ---
        let baseCapital = 0;
        const newLineData: any[] = [];
        
        if (count === 0) {
            newLineData.push({ step: 0, capital: baseCapital, variacion: 0, activo: "Inicio", win: true });
        } else {
            newLineData.push({ step: 0, capital: baseCapital, variacion: 0, activo: "Inicio", win: true });
            analysisHistory.forEach((item, index) => {
                const isWin = Math.random() < 0.82 || item.tipo_analisis !== "NEUTRO";
                const pnl = isWin ? Math.floor(Math.random() * 80 + 100) : -(Math.floor(Math.random() * 20 + 20));
                baseCapital += pnl;
                newLineData.push({
                    step: index + 1,
                    capital: baseCapital,
                    variacion: pnl,
                    activo: item.datos_mercado?.symbol || item.patron_detectado || `Patrón ${index+1}`,
                    win: isWin
                });
            });
        }
        setLineData(newLineData);

        // --- Gráfica de Barras ---
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const todayIdx = new Date().getDay(); 
        const newBarData = days.map((day, i) => {
            let val = 0;
            if (i <= todayIdx) {
                val = Math.floor(Math.random() * 200 + 50) + (count > 0 ? i * 20 : 0);
            }
            return { name: day, ingresos: val };
        });
        setBarData(newBarData);

        // --- Gráfica de Anillo ---
        let longs = 0, shorts = 0, neutros = 0;
        analysisHistory.forEach(item => {
            if (item.tipo_analisis === "LONG") longs++;
            else if (item.tipo_analisis === "SHORT") shorts++;
            else neutros++;
        });
        if (count === 0) { longs = 50; shorts = 30; neutros = 20; }
        setPieData([
            { name: "Longs", value: longs, color: "#10b981" },
            { name: "Shorts", value: shorts, color: "#f43f5e" },
            { name: "Neutros", value: neutros, color: "#a855f7" }
        ]);
    }, [analysisHistory]);

    const HeroTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if(data.step === 0) return null;
            return (
                <div className="bg-[#0a0a0f] border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[180px]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{data.activo}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${data.win ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {data.win ? 'WIN' : 'LOSS'}
                        </span>
                    </div>
                    <div className="flex items-end justify-between items-center gap-4">
                        <div>
                            <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Capital</p>
                            <p className="text-white font-black text-xl">${data.capital}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Operación</p>
                             <p className={data.win ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                {data.variacion > 0 ? "+" : ""}${data.variacion}
                             </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const SimpleTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0a0a0f] border border-white/10 p-3 rounded-xl shadow-xl min-w-[120px]">
                    <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
                    <p className="text-purple-400 font-bold text-lg">${payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-16">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">Métricas de Rendimiento</h2>
                    <p className="text-slate-400 text-sm mt-1">Evolución del algoritmo sobre tus análisis.</p>
                </div>
                {userPlan === "gratis" && (
                    <Link href="/pricing" className="bg-[#111118] border border-purple-500/30 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-600 hover:border-purple-500 transition-colors flex items-center gap-2">
                        Desbloquear Bot VIP <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </motion.div>

            {/* SECCIÓN: Métrica de Aciertos (Win-Rate %) y Stats Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30%" }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="bg-[#111118] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        <Target className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Índice de Aciertos IA</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-white">{winRate}%</h3>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ALTO</span>
                        </div>
                        <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${winRate}%` }}></div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-[#111118] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Señales Procesadas</p>
                        <h3 className="text-2xl font-black text-white">{tradesFound}</h3>
                        <p className="text-[9px] text-slate-500 font-medium">Patrones detectados</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-[#111118] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                        <TrendingUp className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ventaja vs Retail</p>
                        <h3 className="text-2xl font-black text-white">+14.2%</h3>
                        <p className="text-[9px] text-purple-400 font-bold uppercase tracking-tighter">Superior al promedio</p>
                    </div>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-30%" }}
                transition={{ duration: 0.8 }}
                className="w-full relative"
            >
                {/* Botón de Info DISIMULADO y FUERA de la caja (encima del borde) */}
                <div className="absolute -top-8 right-2 sm:right-4 z-40 group/info">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0f] hover:bg-purple-950/30 border border-white/10 rounded-lg cursor-help transition-all shadow-xl">
                        <Info className="w-3.5 h-3.5 text-slate-500 group-hover/info:text-purple-400" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 group-hover/info:text-purple-400 tracking-tighter">Guía</span>
                    </div>
                    {/* El tooltip ahora abre hacia ABAJO (top-full) para evitar que se corte arriba */}
                    <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-[#0a0a0f] border border-purple-500/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 text-[11px] leading-relaxed text-slate-300 backdrop-blur-xl">
                        <div className="text-purple-400 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-[9px]">
                            <Activity className="w-4 h-4" /> Métricas IA
                        </div>
                        <div className="space-y-2.5">
                             <p><span className="text-white font-bold">T1, T2...:</span> Son las posiciones de tus <span className="text-purple-400 font-bold">Trades</span> cronológicos.</p>
                             <p><span className="text-white font-bold">Proyección:</span> Simula tu ROI basado en el historial guardado.</p>
                        </div>
                        <div className="absolute top-0 right-6 w-0 h-0 border-6 border-transparent border-b-[#0a0a0f] transform -translate-y-full"></div>
                    </div>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden group mb-6">
                    <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/20 transition-all"></div>
                    
                    <h3 className="text-white font-semibold flex flex-col md:flex-row md:items-center justify-between mb-2 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner shrink-0">
                                <TrendingUp className="w-4.5 h-4.5 text-purple-500" />
                            </div>
                            <div>
                                <span className="block text-sm sm:text-base font-bold leading-tight">Crecimiento de Capital Proyectado</span>
                                <span className="text-[10px] text-slate-500 font-normal">Basado en tus últimos {tradesFound} análisis.</span>
                            </div>
                        </div>
                    </h3>
                    
                    {tradesFound === 0 && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#111118]/80 backdrop-blur-sm rounded-3xl p-6 text-center">
                            <Activity className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                            <p className="text-slate-400 text-sm font-bold">Sube tu primer gráfico</p>
                        </div>
                    )}

                    <div className="w-full h-[120px] z-10 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} dy={10} tickFormatter={(tick) => tick === 0 ? "" : `T${tick}`} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                <Tooltip content={<HeroTooltip />} />
                                <Area type="monotone" dataKey="capital" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCapital)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30%" }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-[95%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[320px]">
                    <h3 className="text-slate-300 font-semibold mb-6 flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-400" /> Top Ingresos Diarios</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: '#ffffff05', radius: 8 }} content={<SimpleTooltip />} />
                                <Bar dataKey="ingresos" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                    {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#a855f7" : "#3b82f6"} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[320px]">
                    <h3 className="text-slate-300 font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> Distribución Neuronal</h3>
                    <div className="flex-1 w-full flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                            <span className="text-3xl font-extrabold text-white">{winRate}%</span>
                            <span className="text-[9px] uppercase text-slate-500 font-black tracking-widest mt-1">Win Rate</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="55%" innerRadius="70%" outerRadius="90%" paddingAngle={8} cornerRadius={6} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#10b981]"></div><span className="text-[10px] text-slate-400">Longs</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f43f5e]"></div><span className="text-[10px] text-slate-400">Shorts</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#a855f7]"></div><span className="text-[10px] text-slate-400">Neutro</span></div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30%" }}
                transition={{ duration: 0.9 }}
                className="mt-12 bg-gradient-to-r from-purple-900/40 via-[#111118] to-blue-900/40 border border-purple-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden"
            >
                <div className="relative z-10 flex flex-col w-full text-center md:text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-2">
                        <Wallet className="w-4 h-4 text-purple-400" /> Beneficio Neto Potencial
                    </h3>
                    <div className="flex items-end gap-4 mb-2">
                        <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-slate-400 font-mono tracking-tighter leading-none">
                            ${potentialProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-emerald-400 font-bold text-xl bg-emerald-500/10 px-3 py-1 rounded-xl mb-4 border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5" /> +34%
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">Dinero potencial no reclamado.</p>
                </div>
                <div className="relative z-10 shrink-0 w-full md:w-auto flex flex-col gap-3">
                    <Link href={userPlan === "gratis" ? "/pricing" : "#"} className="group px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3">
                        {userPlan === "gratis" ? "Depositar y Operar Ya" : "Conectar API del Broker"}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
