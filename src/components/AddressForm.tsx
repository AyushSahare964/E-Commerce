import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { MapPin, RefreshCcw, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Address {
  id?: string;
  label: string;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressFormProps {
  address?: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Zod Schema optimized for MySQL constraints
const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  full_name: z.string().min(2, "Full name is required").max(100),
  phone_number: z.string().min(10, "Minimum 10 digits required").max(15),
  address_line1: z.string().min(5, "Detail required").max(200),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().min(2, "Required").max(100),
  state: z.string().min(2, "Required"),
  postal_code: z.string().min(5, "Invalid code").max(10),
});

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

const AddressForm: React.FC<AddressFormProps> = ({ address, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Address>({
    label: address?.label || 'Home',
    full_name: address?.full_name || '',
    phone_number: address?.phone_number || '',
    address_line1: address?.address_line1 || '',
    address_line2: address?.address_line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    country: 'India',
    is_default: address?.is_default || false,
  });

  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-sync

    setErrors({});
    const validation = addressSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      // If setting as primary, demote other addresses for this user first
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        label: formData.label,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        is_default: formData.is_default,
      });

      if (error) throw error;

      toast({
        title: "Sector Synchronized",
        description: "Logistics coordinates locked into Zentaro Network.",
      });

      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Sync Failed",
        description: err.message || "Neural link to database interrupted.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600/10 to-transparent border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/20">
                <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <CardTitle className="text-xl font-black uppercase italic tracking-widest text-white">
                {address?.id ? 'Edit Sector' : 'Initialize Sector'}
            </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Label</Label>
              <Select value={formData.label} onValueChange={(v) => handleChange('label', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-blue-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="Home">Home Base</SelectItem>
                  <SelectItem value="Work">Command Center</SelectItem>
                  <SelectItem value="Other">External Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Operator Name</Label>
              <Input
                className="bg-white/5 border-white/10 rounded-2xl h-12 focus:border-blue-500"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Receiver Identity"
              />
              {errors.full_name && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.full_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Protocol</Label>
              <Input
                className="bg-white/5 border-white/10 rounded-2xl h-12"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone_number && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.phone_number}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Postal Code</Label>
              <Input
                className="bg-white/5 border-white/10 rounded-2xl h-12"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
              />
              {errors.postal_code && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.postal_code}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Street Address</Label>
            <Input
              className="bg-white/5 border-white/10 rounded-2xl h-12"
              value={formData.address_line1}
              onChange={(e) => handleChange('address_line1', e.target.value)}
              placeholder="Structure Details / Zone"
            />
            {errors.address_line1 && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.address_line1}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">City</Label>
              <Input
                className="bg-white/5 border-white/10 rounded-2xl h-12 uppercase"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Sector (State)</Label>
              <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-12">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-60">
                  {indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl bg-white/5 p-4 border border-white/5">
            <Checkbox
              id="is_default"
              className="border-blue-500 data-[state=checked]:bg-blue-600 h-5 w-5 rounded-md"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleChange('is_default', checked as boolean)}
            />
            <Label htmlFor="is_default" className="cursor-pointer text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
              Designate as Primary Logistics Sector
            </Label>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl text-zinc-500 hover:text-white font-black uppercase tracking-widest text-xs h-14">
              Abort
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs h-14 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
              {isSubmitting ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
              {isSubmitting ? 'Syncing...' : 'Sync Coordinates'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;