#!/usr/bin/env node
/**
 * Test script to verify Supabase data insertion
 * Run with: node test-supabase.js
 */

import { createRequire } from 'module';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const require = createRequire(import.meta.url);
const { supabase, supabaseAdmin } = require('./server/config/db.js');

async function testRegistration() {
  console.log('\n🧪 Testing Supabase Data Insertion\n');
  console.log('=' .repeat(50));

  // Generate unique email for testing
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@testdomain.com`;
  const testPassword = 'TestPassword123!';

  console.log(`\n1️⃣ Testing User Registration:`);
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);

  try {
    // Test 1: Register user in Supabase Auth
    console.log('\n   → Creating user in Supabase Auth...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('   ❌ Auth signup failed:', signUpError.message);
      return;
    }

    if (!signUpData?.user?.id) {
      console.error('   ❌ No user ID returned from signup');
      return;
    }

    console.log('   ✅ User created in auth.users');
    console.log(`      User ID: ${signUpData.user.id}`);
    console.log(`      Email: ${signUpData.user.email}`);

    // Test 2: Insert profile into Users2 table
    console.log('\n   → Inserting profile into Users2 table...');
    const profileData = {
      id: signUpData.user.id,
      email: signUpData.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabaseAdmin) {
      console.error('   ❌ supabaseAdmin not initialized (missing SUPABASE_SERVICE_ROLE_KEY?)');
      return;
    }

    const { data: profileInsertData, error: profileError } = await supabaseAdmin
      .from('Users2')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('   ❌ Profile insert failed:', profileError.message);
      console.error('      Error details:', profileError);
      return;
    }

    console.log('   ✅ Profile inserted into Users2 table');
    console.log(`      Profile ID: ${profileInsertData.id}`);
    console.log(`      Email: ${profileInsertData.email}`);
    console.log(`      Created at: ${profileInsertData.created_at}`);

    // Test 3: Verify data was actually inserted
    console.log('\n   → Verifying data in Users2 table...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('Users2')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (verifyError) {
      console.error('   ❌ Verification query failed:', verifyError.message);
      return;
    }

    if (!verifyData) {
      console.error('   ❌ Data not found in Users2 table');
      return;
    }

    console.log('   ✅ Data verified in Users2 table');
    console.log('      Retrieved data:', JSON.stringify(verifyData, null, 2));

    console.log('\n✅ All tests passed! Data is being added to Supabase successfully.');
    console.log(`\n📝 Test User Details:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${signUpData.user.id}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('   Stack:', error.stack);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

// Check if Supabase is configured
if (!supabase) {
  console.error('❌ Supabase not configured!');
  console.error('   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

if (!supabaseAdmin) {
  console.error('⚠️  Supabase Admin client not configured!');
  console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env');
  console.error('   Profile insertion to Users2 table will fail without this.');
}

// Run the test
testRegistration()
  .then(() => {
    console.log('Test completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
  });

