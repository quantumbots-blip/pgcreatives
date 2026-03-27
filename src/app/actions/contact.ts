"use server";

import { Resend } from "resend";
import { saveSubmission } from "@/lib/db";

export type ContactState = {
  success: boolean;
  error: string | null;
};

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!firstName || !lastName || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Save to database
  try {
    await saveSubmission({ firstName, lastName, email, company, phone, service, message });
  } catch (err) {
    console.error("[contact] Failed to save to database:", err);
    // Don't block the submission if DB fails — still send email
  }

  // Send email notification
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[contact] No RESEND_API_KEY — logging submission:");
    console.log({ firstName, lastName, email, phone, service, message });
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
    console.error("[contact] Failed to send email:", err);
    return {
      success: false,
      error: "Something went wrong. Please try again or call us directly.",
    };
  }
}
