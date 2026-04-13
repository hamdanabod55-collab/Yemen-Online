import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CreateStoreSchema = z.object({
  store_name: z.string().min(2, 'اسم المتجر يجب أن يكون حرفين على الأقل'),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل'),
  tier: z.enum(['basic', 'pro', 'enterprise']),
  months: z.number().int().min(1).max(60),
});

export async function POST(request) {
  try {
    const cookieStore = cookies();
    
    // 1. Authenticate caller securely via SSR cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // STRONG ADMIN AUTH VALIDATION
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح للقيام بهذا الإجراء.' }, { status: 403 });
    }

    // 2. Setup Service Role Client for bypassing RLS and creating Auth Users securely
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Parse and Validate Input via Zod
    const body = await request.json();
    const validation = CreateStoreSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.errors.map(e => e.message).join(', ') 
      }, { status: 400 });
    }

    const { store_name, email, password, tier, months } = validation.data;

    // 4. EMAIL SAFETY CHECK (Check public users table specifically or auth if possible)
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'هذا البريد مستخدم بالفعل' }, { status: 400 });
    }

    // --- TRANSACTION START ---
    let newAuthUserId = null;

    try {
      // Step A: Create User in Supabase Auth (Service Role required)
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'merchant' }
      });

      if (authError) {
        console.error('[STORE CREATE ERROR - AUTH]', authError);
        return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
      }

      newAuthUserId = authData.user.id;
      console.log(`[STORE CREATE] Auth user created: ${newAuthUserId}`);

      // Step B: EXPLICIT DATA FLOW -> Ensure inserted into `users` table
      // Note: `handle_new_user` trigger exists, we will upsert to ensure explicit compliance and no silent fails.
      const { error: userInsertError } = await adminSupabase.from('users').upsert({
        id: newAuthUserId,
        email: email,
        role: 'merchant'
      }, { onConflict: 'id' });

      if (userInsertError) {
        throw new Error(`Failed to explicit insert users table: ${userInsertError.message}`);
      }
      console.log(`[STORE CREATE] User explicitly updated in users table`);

      // Step C: Insert into `merchants` table
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);
      
      const generatedSlug = 'store-' + Math.random().toString(36).slice(2, 10);

      const { data: merchantData, error: merchantError } = await adminSupabase.from('merchants').insert({
        user_id: newAuthUserId,
        store_name: store_name,
        slug: generatedSlug,
        whatsapp_number: '', // Can be completed by merchant later
        status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString()
      }).select().single();

      if (merchantError) {
        throw new Error(`Failed to create merchant record: ${merchantError.message}`);
      }
      console.log(`[STORE CREATE] Merchant record created: ${merchantData.id}`);

      // Step D: Insert into substitutions (Optional but good practice since admin UI asks for tier & months)
      const { error: subError } = await adminSupabase.from('subscriptions').insert({
        merchant_id: merchantData.id,
        plan: tier,
        start_date: new Date().toISOString(),
        end_date: subscriptionEnd.toISOString(),
        status: 'active'
      });

      if (subError) {
        console.warn(`[STORE CREATE] Subscription entry failed (non-fatal):`, subError);
      }

      // If everything succeeds:
      return NextResponse.json({ success: true, message: 'تم إنشاء المتجر بنجاح' }, { status: 201 });

    } catch (transactionError) {
      console.error('[STORE CREATE ERROR - TRANSACTION FAILED]', transactionError);
      
      // Attempt Cleanup (Rollback)
      if (newAuthUserId) {
        console.log(`[STORE CREATE ROLLBACK] Attempting to delete partial auth user: ${newAuthUserId}`);
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(newAuthUserId);
        if (deleteError) {
          console.error('[STORE CREATE ROLLBACK ERROR] Could not clean up user:', deleteError);
        } else {
          console.log('[STORE CREATE ROLLBACK SUCCESS]');
        }
      }

      return NextResponse.json({ 
        success: false, 
        error: `حدث خطأ أثناء الإنشاء، تم إيقاف العملية: ${transactionError.message}` 
      }, { status: 500 });
    }

  } catch (globalError) {
    console.error('[STORE CREATE ERROR - GLOBAL]', globalError);
    return NextResponse.json({ success: false, error: 'خطأ غير متوقع في السيرفر' }, { status: 500 });
  }
}
