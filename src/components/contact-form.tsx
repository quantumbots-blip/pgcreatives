"use client";

import { useActionState, useRef } from "react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

const initialState: ContactState = { success: false, error: null };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="mb-4 h-10 w-10 text-white/60" />
        <h3 className="text-xl font-semibold text-white">Message Sent</h3>
        <p className="mt-2 max-w-sm text-sm text-white/50">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            formRef.current?.reset();
            // Reset by re-submitting empty to clear useActionState — or just reload
            window.location.reload();
          }}
          className="mt-6 border border-white/20 px-6 py-2 text-sm tracking-wide text-white transition-colors hover:border-white/40"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white">Send Us a Message</h2>
      <p className="mt-1 text-sm text-white/40">
        Fill out the form below and we&apos;ll get back to you within 24 hours.
      </p>

      <form ref={formRef} action={formAction} className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white/60">
              First Name <span className="text-white/30">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              required
              className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white/60">
              Last Name <span className="text-white/30">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              required
              className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/60">
            Email <span className="text-white/30">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-white/60">
            Company Name
          </Label>
          <Input
            id="company"
            name="company"
            placeholder="Your Company"
            className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/60">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service" className="text-white/60">
            Service Interested In
          </Label>
          <Input
            id="service"
            name="service"
            placeholder="e.g. Real Estate Photography, Drone Aerial"
            className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-white/60">
            Message <span className="text-white/30">*</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us about your project..."
            rows={5}
            required
            className="border-white/10 bg-black/50 text-white placeholder:text-white/20"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-400" aria-live="polite">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {pending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </>
  );
}
