import { db, hashPassword } from './src/lib/database';

async function createDemoAccount() {
  try {
    console.log('🔍 Checking for existing demo account...');
    
    // Check if demo account already exists
    const existing = await db.query('SELECT id, email FROM users WHERE email = $1', ['demo.user.2025@kairo.test']);
    
    if (existing.length > 0) {
      console.log('✅ Demo account exists:', existing[0]);
      console.log('🔄 Updating password for existing account...');
      
      // Update password for existing account
      const newPasswordHash = await hashPassword('DemoAccess2025!');
      await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', 
        [newPasswordHash, 'demo.user.2025@kairo.test']);
      console.log('✅ Password updated successfully!');
    } else {
      console.log('🆕 Creating new demo account...');
      
      // Create new demo account with specified UUID
      const passwordHash = await hashPassword('DemoAccess2025!');
      const userId = 'e8ace120-67ff-461e-9942-9fac2fa66398';
      
      // Insert user
      await db.query(`
        INSERT INTO users (id, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
      `, [userId, 'demo.user.2025@kairo.test', passwordHash]);
      
      // Insert user profile with Diamond subscription and extended trial
      await db.query(`
        INSERT INTO user_profiles (id, subscription_tier, trial_end_date, created_at, updated_at)
        VALUES ($1, 'Diamond', NOW() + interval '365 days', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          subscription_tier = 'Diamond',
          trial_end_date = NOW() + interval '365 days',
          updated_at = NOW()
      `, [userId]);
      
      console.log('✅ Demo account created successfully!');
    }
    
    // Verify the account
    const verification = await db.query(`
      SELECT u.id, u.email, u.created_at, up.subscription_tier, up.trial_end_date 
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.id 
      WHERE u.email = $1
    `, ['demo.user.2025@kairo.test']);
    
    console.log('📋 Demo account details:');
    console.log('   Email:', verification[0].email);
    console.log('   ID:', verification[0].id);
    console.log('   Subscription:', verification[0].subscription_tier);
    console.log('   Trial End:', verification[0].trial_end_date);
    console.log('   Password: DemoAccess2025!');
    
    console.log('🎉 Demo account is ready for testing!');
    
  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    process.exit(1);
  }
}

createDemoAccount().then(() => process.exit(0));