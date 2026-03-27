import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(url);
}

export type Submission = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  created_at: string;
};

export async function saveSubmission(data: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO submissions (first_name, last_name, email, company, phone, service, message)
    VALUES (${data.firstName}, ${data.lastName}, ${data.email}, ${data.company || null}, ${data.phone || null}, ${data.service || null}, ${data.message})
  `;
}

export async function getSubmissions(): Promise<Submission[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM submissions ORDER BY created_at DESC
  `;
  return rows as Submission[];
}

export async function getSubmissionStats() {
  const sql = getDb();

  const [totalResult] = await sql`SELECT COUNT(*) as count FROM submissions`;
  const [monthResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `;
  const [weekResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `;
  const topServiceResult = await sql`
    SELECT service, COUNT(*) as count FROM submissions
    WHERE service IS NOT NULL AND service != ''
    GROUP BY service ORDER BY count DESC LIMIT 1
  `;
  const dailyResult = await sql`
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM submissions
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  return {
    total: Number(totalResult.count),
    thisMonth: Number(monthResult.count),
    thisWeek: Number(weekResult.count),
    topService: topServiceResult.length > 0 ? topServiceResult[0].service : "N/A",
    daily: dailyResult as { day: string; count: number }[],
  };
}
