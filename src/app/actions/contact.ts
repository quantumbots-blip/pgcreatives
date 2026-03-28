"use server";

import { Resend } from "resend";
import { saveSubmission } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type ContactState = {
  success: boolean;
  error: string | null;
};

const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  email: 254,
  company: 100,
  phone: 20,
  service: 100,
  message: 5000,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function truncate(value: string, max: number): string {
  return value.slice(0, max);
}

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot check — hidden field that bots fill out
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot) {
    // Silently "succeed" to not reveal the trap
    return { success: true, error: null };
  }

  // Rate limit: 3 submissions per 10 minutes per IP
  const ip = await getClientIp();
  const allowed = await checkRateLimit(`contact:${ip}`, 3, 10);
  if (!allowed) {
    return {
      success: false,
      error: "You've submitted too many messages. Please try again shortly.",
    };
  }

  const firstName = truncate(String(formData.get("firstName") ?? "").trim(), MAX_LENGTHS.firstName);
  const lastName = truncate(String(formData.get("lastName") ?? "").trim(), MAX_LENGTHS.lastName);
  const email = truncate(String(formData.get("email") ?? "").trim(), MAX_LENGTHS.email);
  const company = truncate(String(formData.get("company") ?? "").trim(), MAX_LENGTHS.company);
  const phone = truncate(String(formData.get("phone") ?? "").trim(), MAX_LENGTHS.phone);
  const service = truncate(String(formData.get("service") ?? "").trim(), MAX_LENGTHS.service);
  const message = truncate(String(formData.get("message") ?? "").trim(), MAX_LENGTHS.message);

  if (!firstName || !lastName || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Save to database
  try {
    await saveSubmission({ firstName, lastName, email, company, phone, service, message });
  } catch (err) {
    console.error("[contact] Database save failed:", (err as Error).message);
    // Don't block the submission if DB fails — still send email
  }

  // Send email notification
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No API key — submission was saved to DB, that's enough
    return { success: true, error: null };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "PG Creatives <noreply@pgcreativeswi.com>",
      to: "pgcreativeswisconsin@gmail.com",
      replyTo: email,
      subject: `New Inquiry: ${firstName} ${lastName}`,
      text: [
        `New contact form submission from pgcreativeswi.com`,
        ``,
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Company: ${company || "Not provided"}`,
        `Phone: ${phone || "Not provided"}`,
        `Service: ${service || "Not specified"}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("[contact] Email send failed:", (err as Error).message);
    return {
      success: false,
      error: "Something went wrong. Please try again or call us directly.",
    };
  }
}
