import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS deleted_hackathons (
      name TEXT PRIMARY KEY,
      deleted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await ensureTable();

  if (req.method === 'GET') {
    const rows = await sql`SELECT name FROM deleted_hackathons`;
    return res.json(rows.map(r => r.name));
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    await sql`INSERT INTO deleted_hackathons (name) VALUES (${name}) ON CONFLICT DO NOTHING`;
    return res.json({ ok: true });
  }

  res.status(405).end();
}
