import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ShieldCheck, Zap, ArrowLeft, ShoppingBag, Terminal, Lock, User as UserIcon, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Zentaro Network",
    desc: "Direct access to high-performance shinobi-grade gear.",
    icon: <Zap className="h-6 w-6 text-orange-500" />,
    color: "from-orange-600/20 to-zinc-900/20"
  },
  {
    title: "Identity Protection",
    desc: "Military-grade encryption for every transaction.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
    color: "from-blue-500/20 to-zinc-900/20"
  },
  {
    title: "Legendary Status",
    desc: "Unlock early access to the most exclusive drops.",
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    color: "from-purple-600/20 to-zinc-900/20"
  }
];

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/account");
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          navigate("/");
        } else {
          const message = error.message || "Login failed";
          if (message.toLowerCase().includes("confirm") && message.toLowerCase().includes("email")) {
            setError("Your email is not confirmed yet. Please check your inbox and click the confirmation link before logging in.");
          } else {
            setError(message);
          }
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Validation Error: Passwords do not match");
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (!error) {
          setRegisteredEmail(formData.email);
          setEmailConfirmationPending(true);
          setMode("login");
        } else {
          setError(error.message || "Registration failed");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center p-4">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-600/5 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" />

      <motion.div 
        layout
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/40 shadow-2xl backdrop-blur-3xl md:grid-cols-2"
      >
        {/* LEFT SIDE: Terminal Identity Status */}
        <div className="relative hidden flex-col justify-between bg-white/[0.02] p-16 md:flex border-r border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Terminal className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-tighter text-white uppercase">Zentaro</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Security Protocol 2.0</span>
            </div>
          </div>

          <div className="relative h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "absolute inset-0 flex flex-col justify-center rounded-[2.5rem] p-10 border border-white/5",
                    "bg-gradient-to-br shadow-2xl",
                    FEATURES[currentFeature].color
                )}
              >
                <div className="mb-6 h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    {FEATURES[currentFeature].icon}
                </div>
                <h2 className="text-3xl font-black text-white mb-3 italic uppercase tracking-tight">
                    {FEATURES[currentFeature].title}
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-[250px]">
                    {FEATURES[currentFeature].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            {FEATURES.map((_, i) => (
              <div key={i} className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                {i === currentFeature && (
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Authentication Form */}
        <div className="flex flex-col justify-center p-10 md:p-20">
          {emailConfirmationPending ? (
            <>
              <motion.div layout className="mb-8 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-400" />
                  Confirm Your Access
                </h3>
                <p className="text-zinc-500 mt-3 text-xs md:text-sm font-medium uppercase tracking-widest max-w-md">
                  We have sent a secure confirmation link to
                  {" "}
                  <span className="text-white font-semibold">
                    {registeredEmail}
                  </span>
                  . Open your email, click the link, then return here to log in.
                </p>
              </motion.div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-[10px] md:text-xs font-medium uppercase tracking-widest text-blue-100">
                  <p>
                    If you do not see the email, check your spam folder or promotions tab. The confirmation must be completed before you can access your Zentaro account.
                  </p>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setEmailConfirmationPending(false);
                      setMode("login");
                      setError(null);
                    }}
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30"
                  >
                    I Have Confirmed My Email – Go To Login
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <motion.div layout className="mb-10 text-center md:text-left">
                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                  {mode === "login" ? "Sync Identity" : "New Operator"}
                </h3>
                <p className="text-zinc-500 mt-2 text-sm font-medium uppercase tracking-widest">
                  Zentaro Terminal Access Required.
                </p>
              </motion.div>

              {/* MODE TOGGLE */}
              <div className="mb-10 flex rounded-2xl bg-white/5 p-1.5 border border-white/5 shadow-inner">
                {["login", "register"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m as any); setError(null); }}
                    className={cn(
                        "relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                        mode === m ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {mode === m && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute inset-0 rounded-xl bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                      />
                    )}
                    <span className="relative z-10">{m === "login" ? "Operator Login" : "Initialize Account"}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {mode === "register" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-2"
                    >
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Identity</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input 
                            className="bg-white/5 border-white/10 text-white h-14 pl-12 rounded-2xl focus:border-blue-600 transition-all" 
                            placeholder="Operator Name" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Terminal ID</Label>
                  <Input 
                    className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-blue-600 transition-all" 
                    type="email" 
                    placeholder="operator@zentaro.net" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Encryption Code</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                        className="bg-white/5 border-white/10 text-white h-14 pl-12 rounded-2xl focus:border-blue-600 transition-all" 
                        type="password" 
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                  </div>
                </div>

                {mode === "register" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-2"
                  >
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Verify Encryption</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-blue-600 transition-all" 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </motion.div>
                )}

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <Button 
                  type="submit"
                  disabled={submitting}
                  className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-sm font-black uppercase tracking-widest mt-6 shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                >
                  {submitting ? (
                      <RefreshCcw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                      <Zap className="h-5 w-5 mr-2 fill-current" />
                  )}
                  {submitting ? "Establishing Connection..." : mode === "login" ? "Authorize Login" : "Initialize Profile"}
                </Button>
              </form>
            </>
          )}

          <button onClick={() => navigate("/")} className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white mx-auto transition-colors">
            <ArrowLeft className="h-3 w-3" /> Terminate Session / Back to Store
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Added helper for loading icon
const RefreshCcw = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
)

export default Auth;