import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MobileNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  // Only render on mobile devices
  if (!isMobile) return null;

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Search", icon: Search, path: "/search" },
    { label: "Tactical Bag", icon: ShoppingBag, path: "/cart", badge: totalItems },
    { label: "Terminal", icon: User, path: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 bg-zinc-950/80 pb-safe pt-2 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-1 p-2 transition-all active:scale-90"
            >
              {/* Active Indicator (Ninja Dash Effect) */}
              {isActive && (
                <div className="absolute -top-2 h-1 w-8 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              )}
              
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-orange-500" : "text-zinc-500"
                )} />
                
                {item.badge > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 p-0 text-[8px] font-black border-2 border-zinc-950">
                    {item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isActive ? "text-white" : "text-zinc-600"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;