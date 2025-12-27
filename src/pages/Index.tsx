import React, { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Banner from "@/components/Banner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGrid from "@/components/ProductGrid";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/data/products.js";
import { AlertCircle, RefreshCw } from "lucide-react"; // Added for error UI
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // FETCH LOGIC - now uses Supabase instead of backend MySQL API
  const fetchFromSupabase = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      if (!supabase) {
        throw new Error("Supabase client is not configured. Check your .env file.");
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDbProducts((data as Product[]) || []);
    } catch (error: any) {
      console.error("Supabase Fetch Error:", error);
      setFetchError(error.message || "Failed to connect to Supabase database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromSupabase();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [dbProducts, searchQuery, selectedCategory]);

  // 1. LOADING STATE UI
  if (loading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 text-white">
        {/* Background anime-style energy orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-[pulse_2.5s_ease-in-out_infinite]" />
        </div>

        <div className="relative flex flex-col items-center gap-8 px-6 text-center">
          {/* Rotating anime seal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-32 w-32 rounded-full border border-blue-500/40 bg-zinc-900/80 shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-hidden"
          >
            <motion.div
              className="absolute inset-4 rounded-full border border-blue-500/60"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-purple-500/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10 text-xs font-black uppercase tracking-[0.25em] text-blue-100">
              Zentaro
            </span>
          </motion.div>

          {/* Text + loading bar */}
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Initializing Supabase Link
            </p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Spinning up the Zentaro commerce network and streaming products from the cloud.
            </p>

            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Small status hint */}
          <motion.p
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            Database handshake in progress...
          </motion.p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE UI (Prevents White Screen)
  if (fetchError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Backend Connection Failed</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          We couldn't reach the ShopKart server. Please ensure your backend is running on port 4000.
        </p>
        <Button 
          onClick={fetchFromSupabase}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 rounded-2xl font-bold text-lg"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Try Reconnecting
        </Button>
      </div>
    );
  }

  // 3. MAIN RENDER
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container pb-12 pt-6">
        <div className="space-y-6">
          {/* Only render Banner if products exist to avoid crashes */}
          {dbProducts.length > 0 && <Banner products={dbProducts} />}

          <section>
            <h2 className="text-lg font-semibold text-foreground">Browse Categories</h2>
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Featured Products</h2>
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products from Supabase
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                onViewDetails={(product) => setSelectedProduct(product)}
              />
            ) : (
              <div className="py-20 text-center border-2 border-dashed rounded-[2rem] border-zinc-800">
                <p className="text-zinc-500">No products found matching your criteria.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;