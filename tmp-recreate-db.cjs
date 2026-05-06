const fs = require('fs');
const { Client } = require('pg');
const { URL } = require('url');

const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
if (!m) throw new Error('DATABASE_URL not found in .env');

const cs = m[1];
const url = new URL(cs);
const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));

const admin = new URL(cs);
admin.pathname = '/postgres';
admin.search = '';

(async () => {
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Database created: ${dbName}`);
  } else {
    console.log(`Database already exists: ${dbName}`);
  }
  await client.end();
})().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
