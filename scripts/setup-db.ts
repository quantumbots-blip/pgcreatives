import { neon } from "@neondatabase/serverless";

async function setup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Creating submissions table...");
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      phone VARCHAR(50),
      service VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Migration: add status column to existing tables
  console.log("Ensuring status column exists...");
  await sql`
    ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'
  `;

  console.log("Done.");
}

setup().catch(console.error);
