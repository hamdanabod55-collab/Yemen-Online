import { z } from 'zod';

// Supabase and Database Model Validation Schemas using Zod

export const StoreSubscriptionSchema = z.object({
  tier: z.enum(['Basic', 'Pro', 'Premium'], {
    required_error: "نوع الاشتراك مطلوب",
  }),
  maxProducts: z.number().min(10).max(1000),
  canHaveFeaturedAds: z.boolean(),
});

export const MerchantProductSchema = z.object({
  name: z.string().min(3, { message: "اسم المنتج يجب أن يحتوي على 3 أحرف على الأقل" }),
  description: z.string().max(500, { message: "الوصف طويل جداً" }),
  price: z.number().positive({ message: "السعر يجب أن يكون رقماً إيجابياً" }),
});

export const OrderCheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^\+?967[0-9]{8,9}$/, { message: "رقم الهاتف غير صحيح" }),
  storeId: z.string().uuid(),
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive()
  })).min(1, { message: "يجب اختيار منتج واحد على الأقل" })
});
