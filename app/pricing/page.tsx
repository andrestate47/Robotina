"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Rocket, Star, ShieldCheck, ArrowRight, CreditCard, Lock, ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BorderBeam } from "@/components/magicui/border-beam";

const plans = [
    {
        id: "basic",
        name: "Básico",
        price: "19",
        description: "Ideal para traders principiantes que buscan una ventaja rápida.",
        icon: <Rocket className="w-6 h-6 text-blue-400" />,
        features: [
            "100 Análisis de IA al mes",
            "Soporte por correo",
            "Acceso a mercados básicos",
            "Indicadores estándar",
        ],
        buttonText: "Elegir Básico",
        popular: false,
        color: "from-blue-600 to-cyan-500",
        ringColor: "rgba(59, 130, 246, 0.5)",
    },
    {
        id: "pro",
        name: "Pro",
        price: "49",
        description: "Nuestra opción más popular para traders consistentes.",
        icon: <Zap className="w-6 h-6 text-purple-400" />,
        features: [
            "Análisis Ilimitados",
            "Prioridad en el procesamiento",
            "Todos los mercados (Crypto, Forex, Stocks)",
            "Indicadores de precisión avanzados",
            "Soporte 24/7",
        ],
        buttonText: "Obtener Pro",
        popular: true,
        color: "from-purple-600 to-indigo-600",
        ringColor: "rgba(168, 85, 247, 0.5)",
    },
    {
        id: "elite",
        name: "Elite",
        price: "99",
        description: "Para profesionales que necesitan máxima ventaja algorítmica.",
        icon: <Crown className="w-6 h-6 text-amber-400" />,
        features: [
            "Todo lo del plan Pro",
            "Gestor de cuenta dedicado",
            "Acceso anticipado a nuevas herramientas",
            "Consultas directas sobre patrones",
            "Webinars VIP exclusivos",
        ],
        buttonText: "Ser Elite",
        popular: false,
        color: "from-amber-600 to-orange-500",
        ringColor: "rgba(245, 158, 11, 0.5)",
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [step, setStep] = useState<"pricing" | "checkout" | "success">("pricing");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSelectPlan = (plan: typeof plans[0]) => {
        setSelectedPlan(plan);
        setStep("checkout");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulación de procesamiento de pago
        setTimeout(() => {
            setIsProcessing(false);
            setStep("success");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Botón Flotante de Atrás (Header superior) */}
                <div className="mb-8 flex justify-start">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all group backdrop-blur-md"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Regresar al Dashboard</span>
                    </Link>
                </div>
                
                <AnimatePresence mode="wait">
                    {/* --- ESCENA 1: PRECIOS --- */}
                    {step === "pricing" && (
                        <motion.div
                            key="pricing-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Header Section */}
                            <div className="text-center mb-16">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6"
                                >
                                    <Star className="w-3 h-3 fill-purple-400" />
                                    Planes diseñados para tu éxito
                                </motion.div>
                                
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white"
                                >
                                    Escoge tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Plan de Poder</span>
                                </motion.h1>
                                
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-slate-400 text-lg max-w-2xl mx-auto mb-10"
                                >
                                    Desbloquea análisis ilimitados y herramientas avanzadas de IA para llevar tus operaciones al siguiente nivel.
                                </motion.p>

                                {/* Billing Toggle */}
                                <div className="flex items-center justify-center gap-4">
                                    <span className={billingCycle === "monthly" ? "text-white" : "text-slate-500"}>Mensual</span>
                                    <button
                                        onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                                        className="w-14 h-7 bg-slate-800 rounded-full p-1 relative transition-colors border border-white/10"
                                    >
                                        <motion.div
                                            animate={{ x: billingCycle === "monthly" ? 0 : 28 }}
                                            className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg"
                                        />
                                    </button>
                                    <span className={billingCycle === "yearly" ? "text-white" : "text-slate-500"}>Anual <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full ml-1 font-bold">AHORRA 20%</span></span>
                                </div>
                            </div>

                            {/* Pricing Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.name}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative group rounded-3xl p-8 transition-all duration-300 ${
                                            plan.popular 
                                            ? "bg-slate-900/60 border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] md:scale-105 z-10" 
                                            : "bg-white/5 border border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full z-20">
                                                Más recomendado
                                            </div>
                                        )}

                                        {plan.popular && <BorderBeam size={200} duration={12} delay={9} colorFrom="#a855f7" colorTo="#3b82f6" />}

                                        <div className="mb-8">
                                            <div className="p-3 bg-white/5 rounded-2xl w-fit mb-4">
                                                {plan.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold font-mono">
                                                    ${billingCycle === "monthly" ? plan.price : Math.round(Number(plan.price) * 0.8)}
                                                </span>
                                                <span className="text-slate-500">/mes</span>
                                            </div>
                                            {billingCycle === "yearly" && (
                                                <p className="text-xs text-green-400 mt-1">Facturado anualmente (${Math.round(Number(plan.price) * 0.8 * 12)}/año)</p>
                                            )}
                                        </div>

                                        <div className="space-y-4 mb-10">
                                            {plan.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3 text-sm">
                                                    <div className="mt-0.5 p-0.5 rounded-full bg-green-400/20 text-green-400">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-slate-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn ${
                                            plan.popular
                                            ? `bg-gradient-to-r ${plan.color} text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]`
                                            : "bg-white/10 hover:bg-white/20 text-white hover:scale-[1.02]"
                                        }`}>
                                            {plan.buttonText}
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* --- ESCENA 2: PASARELA DE PAGO (CHECKOUT) --- */}
                    {step === "checkout" && selectedPlan && (
                        <motion.div
                            key="checkout-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <button 
                                onClick={() => setStep("pricing")}
                                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Volver a los planes
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Formulario de Pago */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                        <BorderBeam size={150} duration={8} colorFrom="#10b981" colorTo="#3b82f6" />
                                        
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                            <CreditCard className="w-6 h-6 text-blue-400" />
                                            Información de Pago
                                        </h2>

                                        <form onSubmit={handlePayment} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Número de Tarjeta</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                        <CreditCard className="w-5 h-5" />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder="0000 0000 0000 0000" 
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expira</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="MM/YY" 
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVC</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                            <Lock className="w-5 h-5" />
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            placeholder="***" 
                                                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button 
                                                    type="submit"
                                                    disabled={isProcessing}
                                                    className={`w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${isProcessing ? 'opacity-70' : ''}`}
                                                >
                                                    {isProcessing ? (
                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            Pagar ${billingCycle === "monthly" ? selectedPlan.price : Math.round(Number(selectedPlan.price) * 0.8 * 12)} Ahora
                                                            <ShieldCheck className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </button>
                                                <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest font-medium">Pago seguro encriptado con SSL de 256 bits</p>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Resumen del Pedido */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                                        <h3 className="text-xl font-bold mb-6">Resumen del Plan</h3>
                                        <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedPlan.color} text-white`}>
                                                {selectedPlan.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">Plan {selectedPlan.name}</p>
                                                <p className="text-xs text-slate-400 capitalize">{billingCycle === "monthly" ? "Facturación Mensual" : "Facturación Anual"}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-sm mb-6">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Subtotal</span>
                                                <span className="font-mono">${billingCycle === "monthly" ? selectedPlan.price : Math.round(Number(selectedPlan.price) * 0.8 * 12)}.00</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Impuestos (IVA)</span>
                                                <span className="font-mono">$0.00</span>
                                            </div>
                                            {billingCycle === "yearly" && (
                                                <div className="flex justify-between text-green-400 font-medium">
                                                    <span>Ahorro Anual</span>
                                                    <span>-$20%</span>
                                                </div>
                                            )}
                                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                                <span className="text-white font-bold text-lg">Total</span>
                                                <span className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                                    ${billingCycle === "monthly" ? selectedPlan.price : Math.round(Number(selectedPlan.price) * 0.8 * 12)}.00
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <p className="text-xs text-emerald-500/80 leading-relaxed font-medium">
                                            Acceso instantáneo a todas las herramientas Pro tras completar el pago. Sin contratos, cancela cuando quieras.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- ESCENA 3: ÉXITO (CONFIRMACIÓN) --- */}
                    {step === "success" && (
                        <motion.div
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto text-center py-12"
                        >
                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                >
                                    <CheckCircle2 className="w-12 h-12" />
                                </motion.div>
                            </div>

                            <h1 className="text-4xl font-black mb-4 tracking-tight">¡Bienvenido al Nivel {selectedPlan?.name}!</h1>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                Tu pago ha sido procesado con éxito. Ahora tienes el poder total de la IA a tu disposición para reventar el mercado.
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 text-left">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Siguientes pasos</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                                        <span>Tu suscripción ya está activa en tu perfil.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                                        <span>Revisa tu correo para obtener tu factura y guía de inicio.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                                        <span>Corre a tu panel y realiza tu primer estudio con potencia Pro.</span>
                                    </li>
                                </ul>
                            </div>

                            <Link 
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all hover:scale-[1.05] shadow-xl"
                            >
                                Ir a mi Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Secure Payment Footer (Sólo visible en pricing y checkout) */}
                {step !== "success" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-20 flex flex-col items-center gap-6"
                    >
                        <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="text-xl font-bold text-slate-500 flex items-center gap-1">
                                <CreditCard className="w-5 h-5" /> VISA
                            </div>
                            <span className="text-xl font-bold text-slate-500 italic">Mastercard</span>
                            <span className="text-xl font-bold text-slate-500">PayPal</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            PAGOS CIFRADOS PUNTO A PUNTO (AES-256)
                        </div>

                        <Link href="/" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm mt-4 group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Regresar al Dashboard
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
