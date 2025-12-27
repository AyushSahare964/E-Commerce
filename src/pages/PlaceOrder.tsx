import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/products";
import { MapPin, ShoppingBag, CreditCard, Wallet, ArrowLeft, AlertTriangle, TicketPercent } from "lucide-react";

interface AddressRow {
  id: string;
  label: string | null;
  full_name: string;
  phone_number: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const VALID_COUNTRY = "India";

const PlaceOrder: React.FC = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Redirect if user or cart invalid
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!items || items.length === 0) {
      navigate("/");
    }
  }, [user, items, navigate]);

  // Load addresses from Supabase
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load addresses", error);
        toast({ title: "Address Error", description: "Could not load your saved addresses.", variant: "destructive" });
        return;
      }

      const rows = (data || []) as AddressRow[];
      setAddresses(rows);

      const primary = rows.find((a) => a.is_default) || rows[0];
      setSelectedAddressId(primary ? primary.id : null);
    };

    void loadAddresses();
  }, [user?.id, toast]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const isOutsideIndia = selectedAddress && selectedAddress.country.toLowerCase() !== VALID_COUNTRY.toLowerCase();

  const finalTotal = useMemo(() => {
    const subtotal = totalPrice;
    const clampedDiscount = Math.min(discountAmount, subtotal);
    return Math.max(0, subtotal - clampedDiscount);
  }, [totalPrice, discountAmount]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const code = couponCode.trim().toUpperCase();

      // Simple demo rules – you can later move this to Supabase table
      if (code === "ZENTARO10") {
        const d = Math.round(totalPrice * 0.1);
        setDiscountAmount(d);
        toast({ title: "Coupon applied", description: "10% Shinobi discount activated." });
      } else if (code === "FREESHIP") {
        // shipping is already free, but we can still show success
        setDiscountAmount(0);
        toast({ title: "Coupon applied", description: "Logistics fee compensated for this mission." });
      } else {
        setDiscountAmount(0);
        toast({ title: "Invalid coupon", description: "This protocol code is not recognized.", variant: "destructive" });
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!items.length) return;
    if (!selectedAddress) {
      toast({ title: "Address required", description: "Select a delivery coordinate before proceeding.", variant: "destructive" });
      return;
    }
    if (isOutsideIndia) {
      toast({ title: "Out of range", description: "Zentaro Logistics is currently India-only.", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    try {
      // For now we only simulate a successful order – you can persist to Supabase later
      toast({
        title: "Order initialized",
        description: `Your Zentaro drop is on the way via ${paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI" : "Card"}.`,
      });

      clearCart();
      navigate("/thank-you");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-16 pt-10 text-white">
      <div className="container mx-auto max-w-6xl px-6 space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Store
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Secure Checkout Channel</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Items + address */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30">
                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-widest">Confirm Assets</CardTitle>
                    <CardDescription className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      Review all Zentaro gear before deployment.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-800">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">{item.brand}</p>
                        <p className="text-xs font-bold uppercase text-white line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 border border-emerald-500/30">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-widest">Delivery Coordinates</CardTitle>
                    <CardDescription className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      Confirm address within India for logistics.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                    No saved coordinates found. Go to your Account &gt; Logistics Hub to configure an address before placing orders.
                  </div>
                ) : (
                  <RadioGroup value={selectedAddressId ?? undefined} onValueChange={setSelectedAddressId} className="space-y-3">
                    {addresses.map((addr) => (
                      <Label
                        key={addr.id}
                        htmlFor={addr.id}
                        className="block cursor-pointer rounded-2xl border border-white/5 bg-zinc-900/70 p-4 hover:border-blue-500/60 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem id={addr.id} value={addr.id} className="mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{addr.label || "Address"}</p>
                              {addr.is_default && (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-white mt-1">{addr.full_name}</p>
                            <p className="text-[11px] text-zinc-400 mt-1">
                              {addr.address_line1}
                              {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                            </p>
                            <p className="text-[11px] text-zinc-400 uppercase mt-1">
                              {addr.city}, {addr.state} - {addr.postal_code}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-1">{addr.country}</p>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {selectedAddress && isOutsideIndia && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <p>
                      Zentaro Logistics currently operates only within <span className="font-bold">India</span>. Please use an Indian delivery address.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + payment */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-zinc-900/60 backdrop-blur-xl">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-black uppercase tracking-widest">Mission Summary</CardTitle>
                <CardDescription className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Finalize protocol and choose payment channel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0 text-sm">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Gear Subtotal</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Logistics Fee</span>
                  <span className="text-emerald-400">Compensated</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Coupon Impact</span>
                  <span className={discountAmount > 0 ? "text-emerald-400" : "text-zinc-500"}>
                    {discountAmount > 0 ? "-" + formatPrice(discountAmount) : "None"}
                  </span>
                </div>
                <Separator className="my-4 bg-white/5" />
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Final Sync Total
                  </span>
                  <span className="text-2xl font-black italic text-white tracking-tight">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Coupon section */}
                <form onSubmit={handleApplyCoupon} className="mt-4 space-y-2">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <TicketPercent className="h-3 w-3" />
                    Protocol Coupon
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ZENTARO10 or FREESHIP"
                      className="bg-white/5 border-white/10 text-xs"
                    />
                    <Button
                      type="submit"
                      disabled={applyingCoupon}
                      className="rounded-xl bg-blue-600 px-4 text-[10px] font-black uppercase tracking-widest"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                </form>

                {/* Payment methods */}
                <div className="mt-6 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Payment Channel
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-2"
                  >
                    <Label
                      htmlFor="cod"
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-zinc-950/80 px-4 py-3 text-xs hover:border-blue-500/60"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="cod" value="cod" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Recommended</span>
                    </Label>
                    <Label
                      htmlFor="upi"
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-zinc-950/80 px-4 py-3 text-xs hover:border-blue-500/60"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="upi" value="upi" />
                        <span className="font-semibold">UPI</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">GPay / PhonePe / Paytm</span>
                    </Label>
                    <Label
                      htmlFor="card"
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-zinc-950/80 px-4 py-3 text-xs hover:border-blue-500/60"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="card" value="card" />
                        <span className="font-semibold">Credit / Debit Card</span>
                      </div>
                      <CreditCard className="h-4 w-4 text-zinc-500" />
                    </Label>
                  </RadioGroup>
                </div>

                <Button
                  type="button"
                  disabled={placingOrder || !selectedAddress || isOutsideIndia}
                  onClick={handlePlaceOrder}
                  className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? "Deploying Order..." : "Confirm & Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
