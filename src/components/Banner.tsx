import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, Zap, ChevronRight, ShoppingBag } from "lucide-react";

import { formatPrice, type Product } from "@/data/products"; 
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerProps {
  products: Product[];
}

const Banner: React.FC<BannerProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });

  // LOGIC: Flash Sale Countdown Timer
  useEffect(() => {
    const target = new Date();
    target.setHours(23, 59, 59);
    const timer = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      if (difference <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // LOGIC: Scroller Preparation
  const flashSaleItems = products.filter(p => p.discount > 15);
  const infiniteProducts = [...flashSaleItems, ...flashSaleItems, ...flashSaleItems];

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
    toast({ 
        title: "Sync Successful", 
        description: `${product.name} locked into bag.` 
    });
  };

  const TimerBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center group">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg font-black text-white backdrop-blur-xl border border-white/10 group-hover:border-blue-500/50 transition-colors">
        {value.toString().padStart(2, '0')}
      </div>
      <span className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">{label}</span>
    </div>
  );

  return (
    <div className="relative font-sans p-2 md:p-4 lg:p-6 select-none">
      
      {/* MAIN BANNER CONTAINER */}
      <div className="relative overflow-hidden rounded-[3rem] bg-[#050505] border border-white/5 shadow-2xl max-h-[500px]">
        
        {/* Naruto Background Ambience */}
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-orange-600/5 blur-[100px] animate-pulse" />
        <div className="absolute -right-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[100px] animate-pulse" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center py-10 px-8 md:px-16">
          
          {/* HEADER CONTENT */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-orange-500 border border-orange-500/20 backdrop-blur-md"
              >
                <Zap className="h-3 w-3 fill-current" /> Shinobi Protocol Active
              </motion.div>
              
              <h2 className="text-5xl font-black tracking-tighter text-white md:text-7xl leading-[0.9] uppercase italic">
                Zentaro<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-blue-500">FLASH</span>
              </h2>
              
              <p className="text-zinc-600 max-w-xs mx-auto lg:mx-0 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                High-speed curated gear. <br />Available until session timeout.
              </p>
            </div>

            {/* TIMER HUD */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <TimerBlock value={timeLeft.hours} label="Hrs" />
              <div className="mb-4 text-sm font-black text-white/10">:</div>
              <TimerBlock value={timeLeft.minutes} label="Min" />
              <div className="mb-4 text-sm font-black text-white/10">:</div>
              <TimerBlock value={timeLeft.seconds} label="Sec" />
            </div>
          </div>

          {/* INFINITE SCROLLER: Naruto Run Implementation */}
          <div className="relative flex-1 w-full lg:max-w-xl">
            <div 
              className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <motion.div 
                className="flex gap-6 py-6" 
                animate={{ x: isPaused ? undefined : ["0%", "-33.33%"] }} 
                transition={{ ease: "linear", duration: 20, repeat: Infinity }}
              >
                {infiniteProducts.map((product, idx) => (
                  <motion.div 
                    key={`${product.id}-${idx}`} 
                    whileHover={{ y: -10, scale: 1.02, rotate: -1 }} 
                    onClick={() => setSelectedProduct(product)} 
                    className="group relative w-48 shrink-0 cursor-pointer rounded-[2rem] bg-zinc-900/30 p-4 border border-white/5 backdrop-blur-xl transition-all hover:border-orange-500/30 shadow-xl"
                  >
                    <button 
                      onClick={(e) => handleAddToCart(e, product)} 
                      className="absolute -right-1 -top-1 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg transition-all hover:bg-orange-500 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-zinc-900/80">
                      <img src={product.image} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" alt="" />
                      <div className="absolute top-3 left-3 rounded-full bg-orange-600 px-2 py-0.5 text-[8px] font-black text-white uppercase italic">
                         -{product.discount}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500/70">{product.brand}</p>
                      <h3 className="text-xs font-black text-white tracking-tight truncate uppercase italic">{product.name}</h3>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
                        <ChevronRight className="h-4 w-4 text-zinc-800 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: Tactical Glassmorphism Edition */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            
            {/* Improved Blur-Glass Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedProduct(null)} 
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[20px] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" 
            />
            
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 50, opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-4xl overflow-hidden rounded-[3rem] bg-zinc-900/40 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute right-8 top-8 z-20 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                 
                 {/* Left: Product Image with internal glass tint */}
                 <div className="bg-white/[0.02] p-10 flex items-center justify-center border-r border-white/5">
                    <motion.img 
                      initial={{ scale: 0.8, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      src={selectedProduct.image} 
                      className="max-h-[350px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" 
                      alt={selectedProduct.name} 
                    />
                 </div>

                 {/* Right: Technical Specifications Area */}
                 <div className="p-10 space-y-6 bg-zinc-950/20">
                    <div>
                        <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px]">{selectedProduct.brand}</p>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{selectedProduct.name}</h2>
                    </div>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                        {selectedProduct.description}
                    </p>
                    
                    <div className="flex items-center gap-6">
                        <span className="text-4xl font-black text-white">{formatPrice(selectedProduct.price)}</span>
                        <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg text-orange-500 text-[10px] font-black uppercase">Ninja Deal</div>
                    </div>

                    {/* ANIMATED: Tactical Bag Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={(e) => handleAddToCart(e, selectedProduct)} 
                        className={cn(
                          "relative w-full overflow-hidden h-16 text-lg font-black rounded-2xl transition-all duration-300",
                          "bg-white text-black hover:bg-orange-600 hover:text-white",
                          "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-orange-600/40"
                        )}
                      >
                        {/* Internal Button Shine Sweep */}
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                        />
                        
                        <div className="relative z-10 flex items-center justify-center">
                          <ShoppingBag className="mr-2 h-5 w-5" /> 
                          Add to Tactical Bag
                        </div>
                      </Button>
                    </motion.div>

                    {/* Secure Status Indicator */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Zap className="h-3 w-3 text-orange-500 fill-current animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Secure Procurement Protocol Active</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Banner;