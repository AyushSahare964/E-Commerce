import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api, { ApiError } from '@/lib/api';
import { ChevronLeft } from 'lucide-react';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

const materialCategories = [
  { id: "electronics", name: "Electronics & Gadgets" },
  { id: "fashion", name: "Fashion & Clothing" },
  { id: "home", name: "Home & Kitchen" },
  { id: "beauty", name: "Beauty & Personal Care" },
  { id: "sports", name: "Sports & Fitness" },
  { id: "grocery", name: "Grocery & Food" },
  { id: "hardware", name: "Hardware & Tools" },
  { id: "stationery", name: "Stationery & Books" },
  { id: "pharmacy", name: "Pharmacy & Health" },
  { id: "mobile", name: "Mobile & Accessories" },
];

const shopSchema = z.object({
  shop_name: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  owner_name: z.string().min(2, 'Owner name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address_line1: z.string().min(5, 'Address is required').max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z
    .string({ required_error: 'Please select a state' })
    .min(1, 'Please select a state'),
  postal_code: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
  description: z.string().max(500).optional(),
  materials: z.array(z.string()).min(1, 'Please select at least one material category'),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface Shop {
  id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  materials: string[];
  description: string | null;
  is_verified: boolean;
}

interface ShopFormProps {
  shop?: Shop | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ShopForm: React.FC<ShopFormProps> = ({ shop, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [selectedMaterials, setSelectedMaterials] = React.useState<string[]>(shop?.materials || []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shop_name: shop?.shop_name || '',
      owner_name: shop?.owner_name || '',
      phone: shop?.phone || '',
      email: shop?.email || '',
      address_line1: shop?.address_line1 || '',
      address_line2: shop?.address_line2 || '',
      city: shop?.city || '',
      state: shop?.state ?? undefined,
      postal_code: shop?.postal_code || '',
      description: shop?.description || '',
      materials: shop?.materials || [],
    },
  });

  const toggleMaterial = (materialId: string) => {
    const updated = selectedMaterials.includes(materialId)
      ? selectedMaterials.filter(m => m !== materialId)
      : [...selectedMaterials, materialId];
    setSelectedMaterials(updated);
    setValue('materials', updated);
  };

  const onSubmit = async (data: ShopFormData) => {
    if (!user || !token) {
      toast({
        title: "Login required",
        description: "Please login before managing your shop.",
        variant: "destructive",
      });
      return;
    }

    const shopData = {
      shop_name: data.shop_name,
      owner_name: data.owner_name,
      phone: data.phone,
      address_line1: data.address_line1,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      materials: data.materials,
      user_id: user.id,
      email: data.email || null,
      address_line2: data.address_line2 || null,
      description: data.description || null,
    };

    try {
      if (shop) {
        await api.put(`/api/shops/${shop.id}`, shopData, token);
        toast({
          title: "Shop updated",
          description: "Your shop details have been updated",
        });
      } else {
        await api.post("/api/shops", shopData, token);
        toast({
          title: "Shop registered!",
          description: "Your local shop has been registered successfully",
        });
      }
      onSuccess();
    } catch (e) {
      const err = e as ApiError;
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{shop ? 'Edit Shop' : 'Register Your Shop'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name *</Label>
              <Input id="shop_name" {...register('shop_name')} placeholder="Your Shop Name" />
              {errors.shop_name && <p className="text-sm text-destructive">{errors.shop_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name *</Label>
              <Input id="owner_name" {...register('owner_name')} placeholder="Full Name" />
              {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" {...register('phone')} placeholder="10-digit mobile number" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" {...register('email')} placeholder="shop@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line1">Shop Address *</Label>
            <Input id="address_line1" {...register('address_line1')} placeholder="Street address, Building name" />
            {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Landmark (Optional)</Label>
            <Input id="address_line2" {...register('address_line2')} placeholder="Near landmark" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register('city')} placeholder="City" />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>State *</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">PIN Code *</Label>
              <Input id="postal_code" {...register('postal_code')} placeholder="6-digit PIN" />
              {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Materials Available *</Label>
            <p className="text-sm text-muted-foreground mb-2">Select the categories of products you sell</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {materialCategories.map((material) => (
                <div
                  key={material.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMaterials.includes(material.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleMaterial(material.id)}
                >
                  <Checkbox
                    checked={selectedMaterials.includes(material.id)}
                    onCheckedChange={() => toggleMaterial(material.id)}
                  />
                  <span className="text-sm">{material.name}</span>
                </div>
              ))}
            </div>
            {errors.materials && <p className="text-sm text-destructive">{errors.materials.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Shop Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Tell customers about your shop, specialties, timings, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : shop ? 'Update Shop' : 'Register Shop'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShopForm;
