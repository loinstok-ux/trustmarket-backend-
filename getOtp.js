const { Client } = require('pg');

async function getCode() {
  const client = new Client({ connectionString: 'postgresql://postgres.bkcgcerdisupzkoebvbu:TrustMarket2026%24@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });
  await client.connect();
  const res = await client.query('SELECT * FROM otp_codes ORDER BY "createdAt" DESC LIMIT 1');
  console.log('LATEST OTP:', res.rows[0]);
  await client.end();
}

getCode();
