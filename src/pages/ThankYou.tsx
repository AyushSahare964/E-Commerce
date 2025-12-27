import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-3xl">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <Card className="border-white/5 bg-zinc-900/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl">
          <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.7)]">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-[0.25em] text-center">
              Mission Received
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-zinc-400 text-center max-w-xl">
              Thank you for exploring the Zentaro prototype checkout. Your order flow has been recorded, but
              <span className="font-semibold text-emerald-300"> payment is not processed yet</span>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-10">
            <div className="space-y-3 text-xs md:text-sm text-zinc-300">
              <p>
                This experience is a <span className="font-semibold text-white">prototype demo</span> of a cyberpunk
                e-commerce interface. We will introduce real payment options (UPI, cards, and more) in a future
                production version.
              </p>
              <p>
                If you are interested in building a full website like this for your brand or startup, please reach
                out to the creator at:
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-mono">
                <Mail className="h-3.5 w-3.5 text-blue-300" />
                <span>ayush.sahare24vit.edu</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Drop a mail with your requirements and reference this Zentaro prototype.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 pt-4">
              <Button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 text-xs font-black uppercase tracking-[0.25em] hover:bg-blue-500 shadow-2xl shadow-blue-600/40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Button>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] mt-1 text-center">
                Continue browsing Zentaro gear
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
