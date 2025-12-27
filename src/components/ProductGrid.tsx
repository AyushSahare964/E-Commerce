import React from "react";
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, Terminal, Activity, Zap } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

// Animation Variants for the Staggered Sync
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each asset card pops in 0.1s after the previous one
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, onViewDetails }) => {
  
  // 🛑 HUD: Sector Scan Failure (Empty State)
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[500px] flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-950/20"
      >
        <div className="relative mb-6">
          <SearchX className="h-16 w-16 text-zinc-800" />
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Activity className="h-10 w-10 text-blue-500/20" />
          </motion.div>
        </div>
        
        <h3 className="text-xl font-black uppercase italic tracking-widest text-white">
          Asset Scan Failure
        </h3>
        <p className="mt-2 max-w-xs text-[10px] font-bold uppercase tracking-widest text-zinc-600 leading-relaxed">
          The requested gear is currently outside the Zentaro Network coordinates. <br /> Adjust search filters to re-synchronize.
        </p>
        
        <div className="mt-8 flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500/50">Status: Terminal Search Offline</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* 📡 OPTIONAL: Tactical Scan Bar Effect */}
      <div className="mb-6 flex items-center gap-4 px-2">
        <Zap className="h-4 w-4 text-blue-500 fill-current" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          Syncing {products.length} Shinobi Assets...
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-20"
      >
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout // Smoothly repositions cards when filters change
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ProductCard product={product} onViewDetails={onViewDetails} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProductGrid;