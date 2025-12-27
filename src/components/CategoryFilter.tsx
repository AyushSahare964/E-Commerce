import React from "react";
import { categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="w-full py-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "relative h-12 flex-shrink-0 gap-3 px-6 rounded-2xl overflow-hidden transition-all duration-300",
                    "border border-white/5 font-black uppercase tracking-widest text-[10px]",
                    isActive 
                      ? "text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  )}
                >
                  {/* Background Neural Link Effect for Active Item */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSector"
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 -z-10"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}

                  {/* Active Sector Icon Pulse */}
                  <span className={cn(
                    "text-lg transition-transform duration-300",
                    isActive && "scale-125 brightness-125 animate-pulse"
                  )}>
                    {category.icon}
                  </span>

                  <span className="relative z-10 italic">
                    {category.name}
                  </span>

                  {/* Top Tactical Bar */}
                  {isActive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "40%" }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-white/50 rounded-full"
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
      </ScrollArea>
      
      {/* Sector Status Indicator */}
      <div className="mt-2 flex items-center gap-2 px-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-500/50 animate-pulse">
          Sector Synchronized: {selectedCategory.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default CategoryFilter;