import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log("Verifying connection to:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase.from('merchants').select('id').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log("❌ Connection successful, but tables are MISSING (new database).");
    } else {
      console.log("❌ Error connecting to database:", error.message);
    }
  } else {
    console.log("✅ Connection successful and tables exist!");
  }
}

checkDatabase();
