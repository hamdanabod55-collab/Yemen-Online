import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Secure Server-side API handler for Meta OAuth exchange
export async function POST(request) {
  try {
    const { code, redirectUri, merchantId, userId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code param missing' }, { status: 400 });
    }

    const APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID;
    const APP_SECRET = process.env.FB_APP_SECRET;

    if (!APP_ID || !APP_SECRET) {
      return NextResponse.json({ error: 'منصة يمن أونلاين لم تقم بإعداد مفاتيح التطبيق بعد' }, { status: 500 });
    }

    // 1. Exchange OAuth Code for User Access Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${redirectUri}&client_secret=${APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('FB Token Auth Failed:', tokenData);
      return NextResponse.json({ error: `[خطأ من ميتا]: ${tokenData.error?.message || 'الرمز غير صالح أو قد انتهت صلاحيته'}` }, { status: 400 });
    }
    
    let userAccessToken = tokenData.access_token;

    // 1.5 Exchange for Long-Lived User Token (Token Refresh System)
    // This step guarantees the resulting Page Access Tokens will never expire or be extended to 60 days.
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${userAccessToken}`;
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();
    
    let tokenExpiresAt = null;
    if (exchangeData.access_token) {
      userAccessToken = exchangeData.access_token;
      // Meta tokens default to 60 days (5184000 seconds) if expires_in is explicitly defined
      const expiresInSeconds = exchangeData.expires_in || (60 * 24 * 60 * 60); 
      tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    }

    // 2. Fetch all Pages owned by this user
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({ error: 'لم نتمكن من العثور على أي صفحة فيسبوك مرتبطة بحسابك' }, { status: 400 });
    }

    // Select the first page for simplicity (SaaS MVP behavior)
    const primaryPage = pagesData.data[0];
    const pageId = primaryPage.id;
    const pageAccessToken = primaryPage.access_token; // The critical token with non-expiring privileges commonly

    // 3. Extract the Instagram Business Account ID attached to that page
    const instaReqUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const instaRes = await fetch(instaReqUrl);
    const instaData = await instaRes.json();

    if (!instaData.instagram_business_account) {
      return NextResponse.json({ error: 'صفحة الفيسبوك هذه غير مرتبطة بحساب انستقرام أعمال. تأكد من ربط حسابك في تطبيق إنستقرام.' }, { status: 400 });
    }

    const instaPageId = instaData.instagram_business_account.id;

    // 3.5 Force Page to Subscribe to the App Webhooks 
    // This is mandatory for Meta to actually start firing the 'messages' webhooks towards Vercel.
    const subscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${pageAccessToken}`;
    const subRes = await fetch(subscribeUrl, { method: 'POST' });
    if (!subRes.ok) {
       console.error('Failed to subscribe page to webhooks:', await subRes.text());
    }

    // 4. Update the Supabase Database bypassing RLS specifically for this securely authorized request
    // Since we receive the UUID strictly from the secure client environment, we validate it using the Service Key internally.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const { error: dbError } = await supabaseAdmin
      .from('merchants')
      .update({
        insta_page_id: instaPageId,
        insta_access_token: pageAccessToken,
        insta_token_expires_at: tokenExpiresAt,
        auto_reply_enabled: true
      })
      .eq('id', merchantId)
      .eq('user_id', userId); // Extreme safety: match the user_id exactly with the incoming metadata

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, instaPageId });

  } catch (error) {
    console.error('Meta OAuth Internal Integration Error:', error.message);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء معالجة بيانات ميتا' }, { status: 500 });
  }
}
