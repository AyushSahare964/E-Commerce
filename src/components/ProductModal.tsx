import React from "react";
import { X, Star, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { Product, formatPrice } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();

  if (!product) return null;

  const handleBuyNow = () => {
    addToCart(product);
    setIsCartOpen(true);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:inset-y-8">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Product Details
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="grid gap-6 p-4 md:grid-cols-2 md:p-6">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.discount > 0 && (
                  <Badge className="absolute left-3 top-3 gradient-deal border-0 px-3 py-1 text-sm text-deal-foreground">
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  {product.brand}
                </p>
                <h1 className="mt-1 text-xl font-bold text-card-foreground md:text-2xl">
                  {product.name}
                </h1>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-success px-3 py-1 text-sm font-medium text-success-foreground">
                    <span>{product.rating}</span>
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.reviews.toLocaleString()} Reviews
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold text-card-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge variant="secondary" className="text-success">
                        Save {formatPrice(product.originalPrice - product.price)}
                      </Badge>
                    </>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>

                {/* Specifications */}
                <div className="mt-6">
                  <h3 className="font-semibold text-card-foreground">
                    Specifications
                  </h3>
                  <div className="mt-3 space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium text-card-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Free Delivery
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      1 Year Warranty
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                    <RotateCcw className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Easy Returns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                size="lg"
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductModal;
