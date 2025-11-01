#!/usr/bin/env node
/**
 * Quick diagnostic to check Supabase configuration
 * Run: node check-supabase-config.js
 */

import { createRequire } from 'module';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const require = createRequire(import.meta.url);
const { supabase, supabaseAdmin } = require('./server/config/db.js');

console.log('\n🔍 Supabase Configuration Check\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
const hasUrl = !!process.env.SUPABASE_URL;
const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`   SUPABASE_URL: ${hasUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${hasAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? '✅ Set' : '❌ MISSING!'}`);

// Check clients
console.log('\n🔌 Supabase Clients:');
console.log(`   supabase client: ${supabase ? '✅ Initialized' : '❌ Not initialized'}`);
console.log(`   supabaseAdmin client: ${supabaseAdmin ? '✅ Initialized' : '❌ NOT INITIALIZED'}`);

// Diagnosis
console.log('\n💡 Diagnosis:');

if (!hasServiceKey) {
  console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY is missing!');
  console.log('   📝 Solution:');
  console.log('      1. Go to Supabase Dashboard → Settings → API');
  console.log('      2. Copy the "service_role" key (NOT the anon key)');
  console.log('      3. Add to your .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('      4. Restart your server');
  console.log('\n   ⚠️  Without this key, users will NOT be inserted into Users2 table!');
} else if (!supabaseAdmin) {
  console.log('   ❌ supabaseAdmin client is not initialized');
  console.log('   📝 Check your SUPABASE_SERVICE_ROLE_KEY value in .env');
} else {
  console.log('   ✅ Configuration looks good!');
  console.log('   ✅ Users should be inserted into Users2 table on registration');
}

// Test table access
if (supabaseAdmin) {
  console.log('\n🧪 Testing Table Access:');
  
  // Try to query the Users2 table
  supabaseAdmin
    .from('Users2')
    .select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.log(`   ❌ Cannot access Users2 table: ${error.message}`);
        if (error.message.includes('does not exist')) {
          console.log('   📝 The Users2 table may not exist or has wrong name');
        }
      } else {
        console.log(`   ✅ Can access Users2 table (current count: ${count || 0} records)`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    });
} else {
  console.log('\n' + '='.repeat(50) + '\n');
}

