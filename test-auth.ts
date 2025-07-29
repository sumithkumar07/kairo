import { db, verifyPassword } from './src/lib/database-server';

async function testAuth() {
  try {
    console.log('🔍 Testing authentication for demo account...');
    
    const users = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['demo.user.2025@kairo.test']);
    
    if (users.length === 0) {
      console.log('❌ No user found with email: demo.user.2025@kairo.test');
      return;
    }
    
    console.log('✅ User found:', {
      id: users[0].id,
      email: users[0].email,
      hasPasswordHash: users[0].password_hash ? 'Yes' : 'No'
    });
    
    // Test password verification
    const isValid = await verifyPassword('DemoAccess2025!', users[0].password_hash);
    console.log('🔐 Password validation result:', isValid ? '✅ Valid' : '❌ Invalid');
    
    if (!isValid) {
      console.log('🔧 Password hash preview:', users[0].password_hash.substring(0, 30) + '...');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.close();
  }
}

testAuth();