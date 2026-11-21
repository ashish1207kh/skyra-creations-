const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

process.env.MONGODB_URI = 'mongodb+srv://skyracreationsmodelling_db_user:T5WNIs7foGJkhggr@cluster0.cfd62zb.mongodb.net/skyra_production?retryWrites=true&w=majority';
process.env.MONGODB_DB_NAME = 'skyra_production';

// Dynamically run tsx migration
const { execSync } = require('child_process');
console.log('Starting migration to live MongoDB Atlas cluster...');

try {
  const output = execSync('npx tsx scripts/migrate-supabase-to-mongodb.ts', {
    env: process.env,
    stdio: 'inherit'
  });
  console.log('Migration completed successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
}
