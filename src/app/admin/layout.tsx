import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Allow the login page to render without auth
  // The layout wraps both /admin and /admin/login
  // We check the path via a workaround: if no session, only login page is accessible
  // Next.js doesn't give us the path in layout, so we handle redirect in the dashboard page instead

  return <>{children}</>;
}
