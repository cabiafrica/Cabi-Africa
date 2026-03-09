
const { Client } = require('pg');
const connectionString = 'postgresql://postgres.goasbgflheresuumhmvd:z%gDuB9yZJbSpAd@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function getPassenger() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query("SELECT email, phone, \"fullName\" FROM public.users WHERE role = 'PASSENGER' LIMIT 5;");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Connection error', err.stack);
    } finally {
        await client.end();
    }
}

getPassenger();
