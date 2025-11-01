#!/usr/bin/env node
/**
 * Test profile insertion directly
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

async function testProfileInsertion() {
  console.log('\n🧪 Testing Profile Insertion\n');
  console.log('='.repeat(50));

  if (!supabaseAdmin) {
    console.error('❌ supabaseAdmin not initialized!');
    console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env');
    process.exit(1);
  }

  // First, create a test user via auth
  const timestamp = Date.now();
  const testEmail = `testprofile${timestamp}@testdomain.com`;
  const testPassword = 'TestPassword123!';

  console.log('\n1️⃣ Creating user in auth.users...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error('❌ Auth signup failed:', signUpError.message);
    process.exit(1);
  }

  if (!signUpData?.user?.id) {
    console.error('❌ No user ID returned');
    process.exit(1);
  }

  console.log('✅ User created in auth.users');
  console.log('   User ID:', signUpData.user.id);
  console.log('   Email:', signUpData.user.email);

  // Now try to insert profile
  console.log('\n2️⃣ Inserting profile into Users2 table...');
  const profileData = {
    id: signUpData.user.id,
    email: signUpData.user.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('   Profile data:', JSON.stringify(profileData, null, 2));

  const { data: insertedData, error: profileError } = await supabaseAdmin
    .from('Users2')
    .insert(profileData)
    .select()
    .single();

  if (profileError) {
    console.error('\n❌ Profile insertion FAILED!');
    console.error('   Error:', profileError.message);
    console.error('   Code:', profileError.code);
    console.error('   Details:', profileError.details || 'N/A');
    console.error('   Hint:', profileError.hint || 'N/A');
    console.error('\n   Profile data attempted:', JSON.stringify(profileData, null, 2));
    process.exit(1);
  }

  console.log('✅ Profile inserted successfully!');
  console.log('   Inserted data:', JSON.stringify(insertedData, null, 2));

  // Verify it exists
  console.log('\n3️⃣ Verifying profile exists in Users2...');
  const { data: verifyData, error: verifyError } = await supabaseAdmin
    .from('Users2')
    .select('*')
    .eq('id', signUpData.user.id)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError.message);
    process.exit(1);
  }

  if (!verifyData) {
    console.error('❌ Profile not found in Users2 table!');
    process.exit(1);
  }

  console.log('✅ Profile verified in Users2 table!');
  console.log('   Retrieved data:', JSON.stringify(verifyData, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Profile insertion test PASSED!');
  console.log('\n📝 Test User Details:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('   User ID:', signUpData.user.id);
  console.log('\n   Check Supabase Dashboard → Table Editor → Users2');
  console.log('   You should see this user in the table!\n');
}

testProfileInsertion()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

