require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: merchants, error: merError } = await supabase.from('merchants').select('*');
  const { data: products, error: prodError } = await supabase.from('products').select('*');
  
  console.log("MERCHANTS:", merchants?.length, merError ? 'Error: ' + merError.message : '');
  console.log("PRODUCTS:", products?.length, prodError ? 'Error: ' + prodError.message : '');

  if(products && products.length > 0) {
    console.log("Sample Product:", products[0]);
  }
}

run();
