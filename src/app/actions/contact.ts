"use server";

import { Resend } from "resend";

export type ContactState = {
  success: boolean;
  error: string | null;
};

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || "Not provided";
  const service = (formData.get("service") as string) || "Not specified";
  const message = formData.get("message") as string;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
    return { success: false, error: "Please fill in all required fields." };
  }

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
        `Phone: ${phone}`,
        `Service: ${service}`,
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
