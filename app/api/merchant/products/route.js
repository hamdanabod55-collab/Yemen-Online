import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
        },
      }
    );

    // 1. Verify User Session Securely
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 });
    }

    // 2. MAPPING: Get Merchant ID corresponding to current User's uuid securely.
    // This entirely blocks cross-access / accepting merchant_id from the frontend.
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: 'Active merchant store profile not found for this user.' }, { status: 403 });
    }

    // 3. Parse input correctly
    const body = await request.json();
    const { name, description, price, image } = body;

    // 4. Secure Insert: Attach merchant_id strictly from our backend lookup
    const { error: insertError } = await supabase
      .from('products')
      .insert([
        { 
          merchant_id: merchant.id, 
          name, 
          description, 
          price_usd: parseFloat(price), 
          image_url: image 
        }
      ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Server execution failure' }, { status: 500 });
  }
}
