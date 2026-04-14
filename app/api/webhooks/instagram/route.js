import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Service Client to bypass RLS for background webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// 1. Zod Validation Schema for Meta Instagram Webhook Payload
const metaWebhookSchema = z.object({
  object: z.literal('instagram'),
  entry: z.array(
    z.object({
      id: z.string(), // The IG Page ID receiving the event
      messaging: z.array(
        z.object({
          sender: z.object({ id: z.string() }), // The Customer ID
          recipient: z.object({ id: z.string() }), // The Merchant IG Page ID
          message: z.object({ text: z.string().optional() }).optional()
        })
      ).optional()
    })
  )
});

// GET: Meta Webhook Verification Endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  
  return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
}

// POST: Handle Incoming Instagram Messages
export async function POST(request) {
  try {
    const rawBody = await request.json();
    
    // 2. Validate incoming payload structurally using Zod
    const validationResult = metaWebhookSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('Webhook payload validation failed:', validationResult.error);
      // Always return 200 to Meta so they stop retrying, but log internally
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const payload = validationResult.data;

    // 3. Process each entry and messaging event
    for (const entry of payload.entry) {
      if (!entry.messaging) continue;

      for (const event of entry.messaging) {
        // We only care about messages with actual text (not read receipts or echos)
        if (!event.message || !event.message.text) continue;

        const customerIgId = event.sender.id;
        const merchantPageId = event.recipient.id;

        // 4. Fetch Merchant Data from Supabase
        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .select('id, slug, insta_access_token, auto_reply_enabled')
          .eq('insta_page_id', merchantPageId)
          .single();

        if (merchantError || !merchant || !merchant.auto_reply_enabled) {
          // Merchant not found or bot disabled -> drop silently
          continue;
        }

        // 5. Fetch Custom Message Template 
        const { data: settings } = await supabase
          .from('auto_reply_settings')
          .select('custom_message')
          .eq('merchant_id', merchant.id)
          .single();

        let rawMessage = settings?.custom_message || 'مرحباً، للطلب يرجى زيارة الرابط التالي: {slug}';
        
        // 6. Formatting Dynamic Replacements
        const storeLink = `https://yemen-online.com/store/${merchant.slug || merchant.id}`;
        const finalMessage = rawMessage.replace('{slug}', storeLink);

        // 7. Dispatch Reply back to Meta Graph API
        const graphApiUrl = `https://graph.instagram.com/v19.0/${merchantPageId}/messages`;
        
        const response = await fetch(graphApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${merchant.insta_access_token}`
          },
          body: JSON.stringify({
            recipient: { id: customerIgId },
            message: { text: finalMessage }
          })
        });

        if (!response.ok) {
           const errorBody = await response.text();
           console.error(`Graph API Error for page ${merchantPageId}:`, errorBody);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
    
  } catch (err) {
    console.error('Unhandled Webhook Error:', err);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
