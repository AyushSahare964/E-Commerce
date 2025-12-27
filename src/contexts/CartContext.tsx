import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart items from Supabase whenever the authenticated user changes
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        // No authenticated user: clear any existing cart in memory
        setItems([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("quantity, products(*)")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load cart from Supabase", error);
          return;
        }

        if (!data) {
          setItems([]);
          return;
        }

        const mapped = (data as any[])
          .filter((row) => row.products)
          .map((row) => ({
            ...(row.products as Product),
            quantity: row.quantity as number,
          }));

        setItems(mapped);
      } catch (err) {
        console.error("Unexpected error while loading cart", err);
      }
    };

    void loadCart();
  }, [user?.id]);

  // Helper: upsert a cart item for the current user in Supabase
  const syncCartItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("cart_items")
          .upsert(
            [
              {
                user_id: user.id,
                product_id: productId,
                quantity,
              },
            ],
            { onConflict: "user_id,product_id" }
          );

        if (error) {
          console.error("Failed to sync cart item to Supabase", error);
          toast({
            title: "Cart sync failed",
            description: "We couldn't save your cart to the server.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Unexpected error syncing cart item", err);
      }
    },
    [user, toast]
  );

  // Helper: remove a single cart item for the current user in Supabase
  const deleteCartItem = useCallback(
    async (productId: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          console.error("Failed to remove cart item from Supabase", error);
        }
      } catch (err) {
        console.error("Unexpected error removing cart item from Supabase", err);
      }
    },
    [user]
  );

  // Helper: clear all cart items for the current user in Supabase
  const clearCartInDb = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to clear cart in Supabase", error);
      }
    } catch (err) {
      console.error("Unexpected error clearing cart in Supabase", err);
    }
  }, [user]);

  const addToCart = useCallback(
    (product: Product) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;

          toast({
            title: "Updated cart",
            description: `${product.name} quantity increased`,
          });

          if (user) {
            void syncCartItem(product.id, newQuantity);
          }

          return prevItems.map((item) =>
            item.id === product.id ? { ...item, quantity: newQuantity } : item
          );
        }

        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`,
        });

        if (user) {
          void syncCartItem(product.id, 1);
        }

        return [...prevItems, { ...product, quantity: 1 }];
      });
    },
    [toast, user, syncCartItem]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((prevItems) => {
        const item = prevItems.find((i) => i.id === productId);
        if (item) {
          toast({
            title: "Removed from cart",
            description: `${item.name} removed from your cart`,
            variant: "destructive",
          });
        }

        if (user) {
          void deleteCartItem(productId);
        }

        return prevItems.filter((item) => item.id !== productId);
      });
    },
    [toast, user, deleteCartItem]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );

      if (user) {
        void syncCartItem(productId, quantity);
      }
    },
    [removeFromCart, user, syncCartItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items removed from your cart",
    });

    if (user) {
      void clearCartInDb();
    }
  }, [toast, user, clearCartInDb]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
