import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Terminal,
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [cartPing, setCartPing] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setCartPing(true);
      const timer = setTimeout(() => setCartPing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        
        {/* BRANDING: Zentaro Logo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex cursor-pointer items-center gap-4" 
          onClick={() => navigate('/')}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-blue-600/50 shadow-lg shadow-blue-600/20">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-blue-500/10"
            />
            <img 
              src="https://i.pinimg.com/originals/39/21/bd/3921bd63ab5da1edd875c04c9bd08598.jpg" 
              alt="Zentaro Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black uppercase italic tracking-widest text-white">Zentaro</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-zinc-500">By Ayush Sahare | VIT Pune</span>
          </div>
        </motion.div>

        {/* SEARCH: Desktop with Neural Scan Effect */}
        <div className="hidden max-w-md flex-1 px-8 md:flex">
          <div className="relative w-full group">
            <div className="absolute -inset-0.5 rounded-xl bg-blue-500/20 opacity-0 blur transition duration-300 group-focus-within:opacity-100" />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-blue-500" />
            <Input
              type="search"
              placeholder="Identify legends..."
              className="relative w-full rounded-xl border-white/10 bg-zinc-950 pl-10 pr-4 text-white focus:border-blue-500 transition-all duration-300 placeholder:text-zinc-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ACTIONS & USER PROFILE */}
        <div className="hidden items-center gap-4 md:flex">
          
          {/* Connection Status HUD */}
          <div className="mr-2 flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Secure Link</span>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-zinc-400 hover:text-white hover:bg-white/5">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* USER PROFILE DROPDOWN */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center gap-3 rounded-full border border-white/5 bg-white/5 pl-2 pr-4 py-1.5 transition-all hover:bg-white/10 group">
                  <Avatar className="h-8 w-8 border border-blue-600/50 transition-transform group-hover:scale-110">
                    <AvatarImage src={user.avatar_url || "/avatars/avatar-1.jpg"} className="object-cover" />
                    <AvatarFallback className="bg-zinc-800 text-[10px] font-bold">{user.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white">{user.full_name.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Operator</span>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80 border-white/10 bg-zinc-900/98 p-0 text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden">
                    <motion.img 
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        src={user.avatar_url || "/avatars/avatar-1.jpg"} 
                        className="absolute inset-0 h-full w-full object-cover opacity-30 blur-md" 
                        alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center pt-4">
                        <div className="h-24 w-24 rounded-[2rem] border-4 border-zinc-900 bg-zinc-800 p-1 shadow-2xl overflow-hidden">
                            <img 
                                src={user.avatar_url || "/avatars/avatar-1.jpg"} 
                                className="h-full w-full rounded-[1.5rem] object-cover" 
                                alt="Profile" 
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 pt-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-xl font-black uppercase italic tracking-wider text-white">
                            {user.full_name}
                        </h3>
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 mb-6">
                        System Level: Legendary Operator
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                        <DropdownMenuItem 
                            onClick={() => navigate('/account')} 
                            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white cursor-pointer group/item"
                        >
                            <Terminal className="h-4 w-4 transition-transform group-hover/item:translate-x-1" /> 
                            Dashboard Terminal
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 cursor-pointer"
                        >
                            <Settings className="h-4 w-4" /> 
                            Encryption Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/5 my-3" />

                        <DropdownMenuItem 
                            onClick={() => signOut()} 
                            className="flex items-center justify-center gap-2 rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 cursor-pointer border border-red-500/20"
                        >
                            <LogOut className="h-4 w-4" /> 
                            Terminate Session
                        </DropdownMenuItem>
                    </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="ghost" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white">
              Join Zentaro
            </Button>
          )}

          {/* KINETIC CART BUTTON */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button 
              onClick={() => setIsCartOpen(true)} 
              className={cn(
                "relative rounded-xl bg-blue-600 px-6 font-black shadow-lg transition-all duration-500",
                "hover:bg-blue-500",
                cartPing ? "shadow-[0_0_25px_rgba(37,99,235,0.8)] scale-110" : "shadow-blue-600/20"
              )}
            >
              <motion.div
                animate={cartPing ? { rotate: [0, -15, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.div>

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    key={totalItems} 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-2 -top-2 z-20"
                  >
                    <Badge className="h-5 w-5 rounded-full border-2 border-zinc-950 p-0 text-[10px] font-black bg-white text-black flex items-center justify-center shadow-xl">
                      {totalItems}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <AnimatePresence>
              {cartPing && (
                <motion.div 
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-xl bg-blue-500 -z-10"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* MOBILE TRIGGER */}
        <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-zinc-950 md:hidden overflow-hidden"
          >
            <div className="container py-8 space-y-4">
                {user && (
                    <div className="flex items-center gap-4 rounded-3xl bg-white/5 p-5 border border-white/5">
                        <img src={user.avatar_url || "/avatars/avatar-1.jpg"} className="h-14 w-14 rounded-2xl border border-blue-500 object-cover" alt="" />
                        <div>
                            <p className="text-sm font-black uppercase text-white">{user.full_name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">Zentaro Operator</p>
                        </div>
                    </div>
                )}
                <Button onClick={() => navigate('/account')} className="w-full justify-start gap-4 py-8 font-black uppercase tracking-widest text-[11px] text-zinc-400 hover:text-white rounded-2xl bg-white/5 border border-white/5">
                    <Terminal className="h-5 w-5" /> My Terminal
                </Button>
                <Button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full justify-start gap-4 py-8 font-black uppercase tracking-widest text-[11px] text-red-500 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <LogOut className="h-5 w-5" /> Disconnect
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;