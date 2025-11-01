#!/usr/bin/env node
/**
 * Create a dummy user in Supabase Users2 table
 * Run: node create-dummy-user.js
 */

import { createRequire } from 'module';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const require = createRequire(import.meta.url);
const { supabaseAdmin } = require('./server/config/db.js');

async function createDummyUser() {
  console.log('\n🎭 Creating Dummy User in Users2 Table\n');
  console.log('='.repeat(50));

  if (!supabaseAdmin) {
    console.error('❌ supabaseAdmin not initialized!');
    console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env');
    process.exit(1);
  }

  // Generate dummy user data
  const dummyUserId = randomUUID();
  const timestamp = new Date().toISOString();
  const dummyUser = {
    id: dummyUserId,
    email: `dummy.user.${Date.now()}@testdomain.com`,
    created_at: timestamp,
    updated_at: timestamp,
    last_sign_in_at: null,
  };

  console.log('\n📝 Dummy User Data:');
  console.log('   ID:', dummyUser.id);
  console.log('   Email:', dummyUser.email);
  console.log('   Created At:', dummyUser.created_at);

  try {
    console.log('\n→ Inserting into Users2 table...');
    
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('Users2')
      .insert(dummyUser)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert dummy user:', insertError.message);
      console.error('   Error details:', JSON.stringify(insertError, null, 2));
      
      // Provide helpful error messages
      if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        console.error('\n   💡 The ID already exists. Trying with new UUID...');
        dummyUser.id = randomUUID();
        dummyUser.email = `dummy.user.${Date.now()}@testdomain.com`;
        
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('Users2')
          .insert(dummyUser)
          .select()
          .single();
          
        if (retryError) {
          console.error('   ❌ Retry also failed:', retryError.message);
          process.exit(1);
        } else {
          console.log('   ✅ Successfully inserted on retry!');
          console.log('\n✅ Dummy user created successfully!');
          console.log('\n📋 Created User:');
          console.log('   ID:', retryData.id);
          console.log('   Email:', retryData.email);
          console.log('   Created At:', retryData.created_at);
          console.log('   Updated At:', retryData.updated_at);
          return;
        }
      }
      
      process.exit(1);
    }

    console.log('✅ Successfully inserted into Users2 table!');
    console.log('\n✅ Dummy user created successfully!');
    console.log('\n📋 Created User:');
    console.log('   ID:', insertedData.id);
    console.log('   Email:', insertedData.email);
    console.log('   Created At:', insertedData.created_at);
    console.log('   Updated At:', insertedData.updated_at);
    console.log('   Last Sign In:', insertedData.last_sign_in_at || 'Never');

    // Verify by fetching the data
    console.log('\n→ Verifying data was inserted...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('Users2')
      .select('*')
      .eq('id', dummyUserId)
      .single();

    if (verifyError) {
      console.warn('⚠️  Could not verify data:', verifyError.message);
    } else {
      console.log('✅ Verification successful!');
      console.log('   Data found in Users2 table');
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ You should now see this user in Supabase Dashboard:');
    console.log('   Table Editor → Users2');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the script
createDummyUser()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

