import React from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CartDrawer: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!items.length) {
      toast({
        title: "No assets in bag",
        description: "Add items before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }
    setIsCartOpen(false);
    navigate("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop: Darkened Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer: Zentaro Industrial Aesthetic */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/5 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex h-full flex-col relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

          {/* Header: Tactical Status Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-zinc-900/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-widest text-white">
                  Tactical Bag
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                  Active Sync: {totalItems} Units
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="rounded-full hover:bg-white/5 text-zinc-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items: Logistics Scroll Area */}
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <Package className="h-16 w-16 text-zinc-800 animate-pulse" />
              <h3 className="mt-6 text-xs font-black uppercase italic tracking-widest text-zinc-500">
                No Assets Detected
              </h3>
              <p className="mt-2 text-[10px] font-medium text-zinc-700 uppercase tracking-tighter">
                Bag empty. Initialize procurement immediately.
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl border-white/5 bg-white/5 px-8 font-black uppercase tracking-widest text-[10px]"
                onClick={() => setIsCartOpen(false)}
              >
                Return to Terminal
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex gap-4 rounded-2xl border border-white/5 bg-zinc-900/30 p-4 transition-all hover:border-blue-500/30"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/70">
                              {item.brand}
                            </p>
                            <h4 className="line-clamp-1 text-xs font-black uppercase italic tracking-tight text-white">
                              {item.name}
                            </h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-zinc-700 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-white/5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:text-white"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-[10px] font-black text-white">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:text-white"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-xs font-black text-white italic">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer: Checkout Nexus */}
              <div className="border-t border-white/5 bg-zinc-900/20 p-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Subtotal Protocol</span>
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Logistics Fee</span>
                    <span className="text-blue-500">Compensated</span>
                  </div>
                  <Separator className="my-4 bg-white/5" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Total Sync Cost</span>
                    <span className="text-2xl font-black italic text-white tracking-tighter">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Button
                    className="w-full gap-3 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    Authorize Procurement
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all"
                    onClick={clearCart}
                  >
                    Purge Bag Data
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default CartDrawer;