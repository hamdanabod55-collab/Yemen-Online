import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Secure Server-side API handler for Meta Manual Token exchange
export async function POST(request) {
  try {
    const { token, merchantId, userId } = await request.json();

    if (!token || !merchantId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Validate the Token and fetch Page details (including connected Instagram Account)
    const verifyUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,instagram_business_account&access_token=${token}`;
    const verifyRes = await fetch(verifyUrl);
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.error) {
       console.error('FB Token Validation Failed:', verifyData);
       return NextResponse.json({ error: `[خطأ من ميتا]: ${verifyData.error?.message || 'رمز الوصول غير صالح'}` }, { status: 400 });
    }

    if (!verifyData.instagram_business_account) {
      return NextResponse.json({ error: 'هذا الرمز أو الصفحة غير مرتبطة بحساب انستقرام أعمال. تأكد من ربط حسابك في تطبيق إنستقرام.' }, { status: 400 });
    }

    const pageId = verifyData.id;
    const instaPageId = verifyData.instagram_business_account.id;

    // 2. Try to subscribe the webhook automatically (Best Effort depending on token permissions/App setup)
    const subscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${token}`;
    const subRes = await fetch(subscribeUrl, { method: 'POST' });
    if (!subRes.ok) {
       console.error('Failed to subscribe page to webhooks:', await subRes.text());
       // We don't fail the request here, because if they create the token manually using Graph API Explorer on our app it works.
       // However if they used their own app, the webhook might need to be configured in their own developer dashboard.
    }

    // 3. Update the Supabase Database bypassing RLS specifically for this securely authorized request
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { error: dbError } = await supabaseAdmin
      .from('merchants')
      .update({
        insta_page_id: instaPageId,
        insta_access_token: token,
        insta_token_expires_at: null, // Manual tokens may be long-lived or permanent
        auto_reply_enabled: true
      })
      .eq('id', merchantId)
      .eq('user_id', userId);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, instaPageId });

  } catch (error) {
    console.error('Meta Internal Integration Error:', error.message);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء معالجة بيانات ميتا' }, { status: 500 });
  }
}
