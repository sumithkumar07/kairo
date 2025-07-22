import { initializeDatabase } from '@/lib/database-server';
import { initializeGodTierFeatures } from '@/lib/god-tier-database-schema';

async function main() {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Base database initialized successfully!');
    
    console.log('Initializing god-tier features...');
    await initializeGodTierFeatures();
    console.log('God-tier features initialized successfully!');
    
    console.log('🌟 All divine powers have been unleashed! The database is ready for omnipotence.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

main();