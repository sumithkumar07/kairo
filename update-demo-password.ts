import { db, hashPassword } from './src/lib/database';

async function updateDemoPassword() {
  try {
    console.log('🔄 Updating demo account password using correct database module...');
    
    // Update password for existing account using the same database module as auth
    const newPasswordHash = await hashPassword('DemoAccess2025!');
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', 
      [newPasswordHash, 'demo.user.2025@kairo.test']);
    
    console.log('✅ Password updated successfully!');
    
    // Verify the update
    const verification = await db.query(`
      SELECT u.id, u.email, u.created_at, up.subscription_tier, up.trial_end_date 
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.id 
      WHERE u.email = $1
    `, ['demo.user.2025@kairo.test']);
    
    console.log('📋 Demo account verified:');
    console.log('   Email:', verification[0].email);
    console.log('   ID:', verification[0].id);
    console.log('   Subscription:', verification[0].subscription_tier || 'Free');
    console.log('   Password: DemoAccess2025!');
    
    console.log('🎉 Demo account is ready for API login testing!');
    
  } catch (error) {
    console.error('❌ Error updating demo password:', error);
    process.exit(1);
  }
}

updateDemoPassword().then(() => process.exit(0));