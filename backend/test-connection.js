require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(client => {
    console.log('✅ Supabase Connected!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('📊 PostgreSQL Version:', res.rows[0].version);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  });