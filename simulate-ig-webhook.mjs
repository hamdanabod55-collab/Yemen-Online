/**
 * سكريبت لتجربة البوت محلياً ومحاكاة رسائل انستقرام
 * لتشغيل السكريبت:
 * 1. قم بتشغيل سيرفر التطبيق محلياً: npm run dev
 * 2. افتح نافذة تيرمينال جديدة ونفذ هذا السكريبت: node simulate-ig-webhook.mjs
 */

async function simulateMessage() {
  // يجب عليك تغيير هذا المعرف إلى معرف صفحة انستقرام (insta_page_id) الموجودة في قاعدة البيانات لأحد التجار
  const merchantPageId = '1234567890';
  const customerIgId = '987654321'; // معرف عشوائي لعميل وهمي

  const payload = {
    object: 'instagram',
    entry: [
      {
        id: merchantPageId,
        messaging: [
          {
            sender: { id: customerIgId },
            recipient: { id: merchantPageId },
            message: { text: "مرحبا بكم، هل هذا المنتج متوفر؟ (رسالة تجريبية)" }
          }
        ]
      }
    ]
  };

  try {
    console.log('⏳ جاري إرسال الطلب الوهمي لمحاكاة انستقرام...');
    const res = await fetch('http://localhost:3000/api/webhooks/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log("الرمز المرتجع (Status):", res.status);
    
    try {
      const data = await res.json();
      console.log("النتيجة:", data);
      console.log("✅ تمت المحاكاة بنجاح!");
    } catch {
      console.log("⚠️ السيرفر أرجع رداً ليس بصيغة JSON");
    }
  } catch (error) {
    console.error("❌ حدث خطأ في الاتصال بالسيرفر:", error.message);
  }
}

simulateMessage();
