import { db as dbServer, verifyPassword as verifyPasswordServer } from './src/lib/database-server';
import { db as dbMain, verifyPassword as verifyPasswordMain } from './src/lib/database';

async function debugAuth() {
  try {
    console.log('🔍 Testing both auth libraries...');
    
    // Test with database-server.ts (used by demo account creation)
    const usersServer = await dbServer.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['demo.user.2025@kairo.test']);
    
    if (usersServer.length > 0) {
      console.log('✅ User found via database-server.ts');
      const isValidServer = await verifyPasswordServer('DemoAccess2025!', usersServer[0].password_hash);
      console.log('🔐 Password via database-server.ts:', isValidServer ? '✅ Valid' : '❌ Invalid');
    }
    
    // Test with database.ts (used by signin API)
    const usersMain = await dbMain.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['demo.user.2025@kairo.test']);
    
    if (usersMain.length > 0) {
      console.log('✅ User found via database.ts');
      const isValidMain = await verifyPasswordMain('DemoAccess2025!', usersMain[0].password_hash);
      console.log('🔐 Password via database.ts:', isValidMain ? '✅ Valid' : '❌ Invalid');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await dbServer.close();
  }
}

debugAuth();