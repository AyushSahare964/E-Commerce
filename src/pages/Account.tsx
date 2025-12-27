import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressForm from "@/components/AddressForm";
import ShopForm from "@/components/ShopForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  MapPin, 
  Store, 
  LogOut, 
  Settings, 
  Plus, 
  ShieldCheck,
  Zap,
  Globe,
  RefreshCcw,
  Sparkles,
  Trash2,
  Home,
  Briefcase,
  ArrowLeft,
  Lock,
  KeyRound
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const AVATAR_PROTOCOL = [
  "https://tse3.mm.bing.net/th/id/OIP.K8O_ArBuc2InpMji5NydWAHaEK?w=760&h=427&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse3.mm.bing.net/th/id/OIP.FoKjHE6qa6EizD6jYJ-3QAHaHa?w=1536&h=1536&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse1.mm.bing.net/th/id/OIP.kLGMtDnkI-2mpp82I7EMVwHaHa?w=2000&h=2000&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.4_eZuQz6DFMttMIdpwbEwgHaNI?w=736&h=1305&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse1.mm.bing.net/th/id/OIP.0tjbYXJkYblPPkIr7i6_gQAAAA?w=300&h=535&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.VXWmBP4YXr_fTy02eoysngHaOu?pid=ImgDet&w=176&h=350&c=7&dpr=1.3&o=7&rm=3",
  "https://tse3.mm.bing.net/th/id/OIP.YBg_1ocQsq0zbUB7gBthSgHaHa?pid=ImgDet&w=185&h=185&c=7&dpr=1.3&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.kJH2u4KmxDTwDkdAm3MuhQHaEK?w=1600&h=900&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse4.mm.bing.net/th/id/OIP.4hMlrKAzuPDcmRCWyChv5gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse3.mm.bing.net/th/id/OIP.vUF6S5nYjoTzieDs5ahQAgHaND?pid=ImgDet&w=185&h=326&c=7&dpr=1.3&o=7&rm=3"
];

const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]); 
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_PROTOCOL[0]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for success engagement animation
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoadingAddresses(true);
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch coordinates", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Handle successful address submission with animation
  const handleAddressSuccess = () => {
    setShowAddressForm(false);
    fetchAddresses();
    
    // Trigger Avatar Neural Pulse
    setIsSuccessAnimating(true);
    setTimeout(() => setIsSuccessAnimating(false), 2000); 
  };

  const handleAvatarSync = async (url: string) => {
    try {
      if (!user) return;
      setIsSyncing(true);
      setSelectedAvatar(url);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Protocol Synced", description: "Identity updated on Zentaro Network." });
    } catch (e) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({ title: "Missing Fields", description: "Enter and confirm your new encryption code.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Validation Error", description: "New encryption codes do not match.", variant: "destructive" });
      return;
    }
    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Protocol Updated", description: "Security encryption successfully reset via Supabase.", });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (e) {
      const err = e as Error;
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-10 text-white selection:bg-blue-600/30">
      <div className="container mx-auto max-w-6xl px-6">
        
        {/* TOP NAVIGATION BAR */}
        <div className="mb-8 flex items-center justify-between">
           <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
           >
             <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
             Return to Store
           </Button>
           
           <div className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5">
             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Connection: Secure</span>
           </div>
        </div>

        {/* HEADER: Operator Status */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Zentaro <span className="text-blue-600 font-black">Terminal</span>
            </h1>
            <p className="mt-1 text-zinc-500 font-medium uppercase tracking-[0.2em] text-[10px]">
              System Operator: {user.full_name} | VIT Pune
            </p>
          </motion.div>
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-xl"
            onClick={async () => { await signOut(); navigate("/"); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Disconnect Session
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT: IDENTITY CARD with Dynamic Animation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-4">
            <Card className="overflow-hidden border border-white/5 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
              <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-700 to-zinc-900" />
              <CardContent className="relative pt-0">
                <div className="absolute -top-14 left-6">
                  {/* Enhanced Neural Link Container */}
                  <div className={cn(
                      "relative h-28 w-28 rounded-[2rem] border-4 border-zinc-900 bg-zinc-800 p-1 shadow-2xl transition-all duration-700",
                      isSuccessAnimating && "ring-8 ring-blue-500/50 scale-110 shadow-[0_0_40px_rgba(59,130,246,0.9)]"
                    )}>
                    
                    {/* Pulsing Data-Burst Ring */}
                    <AnimatePresence>
                        {isSuccessAnimating && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.6, 0], scale: [1, 1.5, 2] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, repeat: 1 }}
                                className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-blue-500 to-cyan-400 blur-md"
                            />
                        )}
                    </AnimatePresence>

                    <img 
                      src={selectedAvatar} 
                      className={cn(
                          "h-full w-full rounded-[1.8rem] object-cover transition-all duration-500 relative z-10", 
                          isSyncing && "opacity-30 blur-sm",
                          isSuccessAnimating && "brightness-150 contrast-125"
                      )} 
                      alt="Current Avatar" 
                    />
                    
                    {/* Overlay Icons for Interaction */}
                    {(isSyncing || isSuccessAnimating) && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            {isSyncing ? (
                                <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
                            ) : (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,1)]"
                                >
                                    <Zap className="h-6 w-6 fill-current" />
                                </motion.div>
                            )}
                        </div>
                    )}
                  </div>
                </div>

                <div className="pt-16 px-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight">{user.full_name}</h2>
                    <ShieldCheck className={cn(
                        "h-5 w-5 transition-colors duration-500", 
                        isSuccessAnimating ? "text-green-500" : "text-blue-500"
                    )} />
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{user.email}</p>
                </div>
                
                <Separator className="my-8 bg-white/5" />
                
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Identity Selection Protocol</h3>
                    <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_PROTOCOL.map((url, idx) => (
                      <button
                        key={idx}
                        disabled={isSyncing}
                        onClick={() => handleAvatarSync(url)}
                        className={cn(
                          "aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-110",
                          selectedAvatar === url ? "border-blue-500 bg-blue-500/20" : "border-white/5 grayscale hover:grayscale-0"
                        )}
                      >
                        <img src={url} className="h-full w-full object-cover" alt={`Avatar ${idx}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: TABS INTERFACE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8">
            <Tabs defaultValue="addresses" className="w-full">
              <TabsList className="mb-8 h-auto w-full justify-start gap-2 bg-transparent p-0">
                {["addresses", "shop", "settings"].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="rounded-xl border border-white/5 px-8 py-3 text-xs font-black uppercase tracking-widest data-[state=active]:bg-blue-600"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="addresses" className="mt-0">
                  <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between p-8">
                      <div>
                        <CardTitle className="text-2xl font-black uppercase italic">Logistics Hub</CardTitle>
                        <CardDescription className="text-zinc-500">Manage delivery coordinates for your acquisitions.</CardDescription>
                      </div>
                      {!showAddressForm && (
                        <Button onClick={() => setShowAddressForm(true)} className="bg-white text-black hover:bg-zinc-200 rounded-xl font-black transition-all active:scale-95">
                          <Plus className="mr-2 h-4 w-4" /> New Sector
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      {showAddressForm ? (
                        <AddressForm 
                          onClose={() => setShowAddressForm(false)} 
                          onSuccess={handleAddressSuccess} 
                        />
                      ) : (
                        <div className="space-y-4">
                          {loadingAddresses ? (
                            <div className="flex justify-center py-12"><RefreshCcw className="animate-spin text-zinc-600" /></div>
                          ) : addresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {addresses.map((addr) => (
                                <div key={addr.id} className="group relative rounded-3xl border border-white/5 bg-white/5 p-6 hover:border-blue-500/50 transition-all">
                                  <div className="flex items-center gap-2 mb-4">
                                    {addr.label === "Home" ? <Home className="h-3 w-3 text-blue-500" /> : <Briefcase className="h-3 w-3 text-zinc-500" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{addr.label}</span>
                                    {addr.is_default && <span className="ml-auto text-[8px] bg-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Primary</span>}
                                  </div>
                                  <p className="font-bold text-white uppercase tracking-tight">{addr.full_name}</p>
                                  <p className="text-xs text-zinc-500 mt-1">{addr.address_line1}</p>
                                  <p className="text-xs text-zinc-500 uppercase font-bold mt-2">{addr.city}, {addr.state} - {addr.postal_code}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 py-16 text-center">
                              <Globe className="h-10 w-10 text-zinc-600 mb-4" />
                              <h3 className="text-lg font-bold">Coordinates Not Set</h3>
                              <p className="text-sm text-zinc-500">Initialize your primary delivery zone to begin orders.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Shop and Settings Tabs (Styling remains consistent) */}
                <TabsContent value="shop" className="mt-0">
                   <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-md">
                     <CardHeader className="p-8">
                       <CardTitle className="text-2xl font-black uppercase italic">Merchant Syndicate</CardTitle>
                       <CardDescription className="text-zinc-500">Authorize your local entity on the Zentaro Network.</CardDescription>
                     </CardHeader>
                     <CardContent className="p-8 pt-0">
                        <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-10 shadow-2xl">
                          <Zap className="h-6 w-6 text-white mb-4" />
                          <h3 className="text-xl font-black uppercase text-white">Join the Syndicate</h3>
                          <p className="text-blue-100 text-lg leading-relaxed max-w-lg mt-2">Register your business to start distributing products directly through Zentaro.</p>
                          <Button className="mt-8 bg-white text-blue-600 font-black px-10 py-6 rounded-2xl">Initialize Merchant Profile</Button>
                        </div>
                     </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-md">
                    <CardHeader className="p-8 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-black uppercase italic flex items-center gap-2">
                            <Lock className="h-5 w-5 text-blue-500" />
                            Encryption Protocol
                          </CardTitle>
                          <CardDescription className="text-zinc-500 text-xs mt-1">
                            Manage your Zentaro access key through Supabase secure auth.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
                        <KeyRound className="h-4 w-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">
                            Supabase Password Reset
                          </p>
                          <p className="mt-1 text-xs text-blue-100/80">
                            Your encryption code is stored and verified by Supabase. Use the control below to set a new password for this account.
                          </p>
                        </div>
                      </div>

                      {!showPasswordForm ? (
                        <Button
                          type="button"
                          onClick={() => setShowPasswordForm(true)}
                          className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          Reset Encryption Code
                        </Button>
                      ) : (
                        <form className="space-y-5 max-w-md" onSubmit={handleChangePassword}>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              New Encryption Code
                            </Label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-white/5 border-white/10"
                              placeholder="Enter new password"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              Confirm Encryption Code
                            </Label>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="bg-white/5 border-white/10"
                              placeholder="Re-enter new password"
                              required
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              type="submit"
                              disabled={changingPassword}
                              className="flex-1 bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                              {changingPassword ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4" />
                              )}
                              {changingPassword ? "Updating..." : "Save New Code"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setNewPassword("");
                                setConfirmPassword("");
                              }}
                              className="px-4 py-4 rounded-2xl border-white/10 text-xs font-black uppercase tracking-widest"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;