import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data: merchants } = await supabase.from('merchants').select('*');
  const { data: products } = await supabase.from('products').select('*');
  
  return NextResponse.json({
    merchantsCount: merchants?.length || 0,
    merchantsSample: merchants?.slice(0, 2),
    productsCount: products?.length || 0,
    productsSample: products?.slice(0, 5)
  });
}
