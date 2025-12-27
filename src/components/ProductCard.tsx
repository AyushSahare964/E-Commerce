import React from "react";
import { Star, ShoppingCart, Truck, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Product, formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-white/5 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] rounded-[2.5rem]"
        onClick={() => onViewDetails(product)}
      >
        {/* Asset Visual Section - UPDATED RATIO */}
        {/* Changed aspect-square to aspect-[4/3] for a sleeker profile */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {product.discount > 0 && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-orange-600 px-3 py-1 text-[10px] font-black uppercase italic text-white shadow-xl">
              -{product.discount}% FLASH
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase italic tracking-[0.2em] text-red-500 border-2 border-red-500/20 px-4 py-2 rounded-2xl">
                Asset Depleted
              </span>
            </div>
          )}
        </div>

        {/* Intelligence Details */}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500/80">
              {product.brand}
            </p>
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-700 group-hover:text-blue-500 transition-colors" />
          </div>

          <h3 className="line-clamp-1 text-base font-black uppercase italic tracking-tighter text-white">
            {product.name}
          </h3>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-black text-white">
              <span>{product.rating}</span>
              <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
            </div>
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              {product.reviews.toLocaleString()} Records
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black italic tracking-tighter text-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-zinc-600 line-through font-bold">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
            <Truck className="h-3.5 w-3.5 text-blue-600/50" />
            <span>
              {product.deliveryDays === 1 ? "Priority: 24H" : `Logistics: ${product.deliveryDays}D`}
            </span>
          </div>

          {/* Powered Blue Buy Button */}
          <Button
            className={cn(
              "mt-6 w-full gap-3 rounded-2xl h-14 font-black uppercase italic tracking-[0.15em] text-xs transition-all duration-500 relative overflow-hidden",
              product.inStock 
                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 border border-blue-400/30" 
                : "bg-zinc-800 text-zinc-700 cursor-not-allowed border border-white/5"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (product.inStock) {
                addToCart(product);
              }
            }}
            disabled={!product.inStock}
          >
            {product.inStock ? (
              <>
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
                />
                
                <Zap className="h-4 w-4 fill-current relative z-10" />
                <span className="relative z-10">Buy Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
              </>
            ) : (
              "Sold Out"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;