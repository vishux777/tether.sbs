const { supabase, supabaseAdmin } = require('../config/db');

async function register(req, res) {
  const { email, password, data } = req.body || {};
  
  console.log('\n📝 Registration request received');
  console.log('   Email:', email);
  console.log('   Password:', password ? '***' : 'missing');
  console.log('   Additional data:', data || 'none');
  
  if (!email || !password) {
    console.warn('❌ Missing required fields');
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Sign up the user in Supabase Auth
    console.log('→ Creating user in Supabase Auth...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data } 
    });
    
    if (signUpError) {
      console.error('❌ Auth signup failed:', signUpError.message);
      return res.status(400).json({ message: signUpError.message });
    }

    console.log('✅ User created in auth.users');
    console.log('   User ID:', signUpData?.user?.id);
    console.log('   Email:', signUpData?.user?.email);

    // If user was created successfully, create a profile record in Supabase
    if (signUpData?.user?.id) {
      const profileData = {
        id: signUpData.user.id,
        email: signUpData.user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(data || {})
      };

      // Use admin client to insert into Users2 table (bypasses RLS)
      if (supabaseAdmin) {
        const { data: insertedData, error: profileError } = await supabaseAdmin
          .from('Users2')
          .insert(profileData)
          .select()
          .single();

        // If profile insert fails, log but don't fail the registration
        // (user is already created in auth.users)
        if (profileError) {
          console.error('\n❌ Profile creation failed (user still registered):');
          console.error('   Error:', profileError.message);
          console.error('   Code:', profileError.code);
          console.error('   Details:', profileError.details || 'N/A');
          console.error('   Hint:', profileError.hint || 'N/A');
          console.error('   Profile data attempted:', JSON.stringify(profileData, null, 2));
          console.error('');
        } else {
          console.log('\n✅ Profile inserted into Users2 table successfully');
          console.log('   User ID:', insertedData?.id);
          console.log('   Email:', insertedData?.email);
          console.log('   Created At:', insertedData?.created_at);
          console.log('');
        }
      } else {
        console.warn('⚠️  supabaseAdmin not initialized - profile will NOT be inserted into Users2');
        console.warn('   Missing SUPABASE_SERVICE_ROLE_KEY in .env file');
      }
    }

    // Return sign-up data including session if available
    return res.status(201).json({
      user: signUpData.user,
      session: signUpData.session,
      access_token: signUpData.session?.access_token,
      refresh_token: signUpData.session?.refresh_token,
      expires_at: signUpData.session?.expires_at,
      expires_in: signUpData.session?.expires_in,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (signInError) {
      return res.status(400).json({ message: signInError.message });
    }

    // Update profile last_sign_in_at if profile exists
    if (signInData?.user?.id && supabaseAdmin) {
      await supabaseAdmin
        .from('Users2')
        .update({ 
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        })
        .eq('id', signInData.user.id);
    }

    // Return sign-in data with session tokens
    return res.json({
      user: signInData.user,
      session: signInData.session,
      access_token: signInData.session?.access_token,
      refresh_token: signInData.session?.refresh_token,
      expires_at: signInData.session?.expires_at,
      expires_in: signInData.session?.expires_in,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { register, login };


