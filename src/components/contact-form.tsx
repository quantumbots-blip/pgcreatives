"use client";

import { useState, useActionState, useRef } from "react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Layers, Loader2, Mail, Phone, User } from "lucide-react";

const initialState: ContactState = { success: false, error: null };

export function ContactForm() {
  const [resetKey, setResetKey] = useState(0);
  return <ContactFormInner key={resetKey} onReset={() => setResetKey((k) => k + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const prior = state.values;

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-signal/35 bg-signal-dim">
          <CheckCircle2 className="h-7 w-7 text-signal-ink" />
        </div>
        <h3 className="display-2 !text-[clamp(1.5rem,2.4vw,2rem)] text-white">
          Message sent.
        </h3>
        {/* Same promise the rest of the site makes. This used to say "within
            24 hours" while /contact and the home form both said same day. */}
        <p className="lede mt-4 max-w-md">
          Thanks for reaching out, we usually reply the same day.
        </p>
        <button type="button" onClick={onReset} className="btn btn-ghost mt-8">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6 sm:space-y-8">
      {/* Honeypot, hidden from humans, filled by bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="firstName" className="field-label">
            First name <span className="field-required">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              id="firstName"
              name="firstName"
              defaultValue={prior?.firstName ?? ""}
              placeholder="John"
              required
              maxLength={50}
              autoComplete="given-name"
              className="field field-input has-icon"
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="lastName" className="field-label">
            Last name <span className="field-required">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              id="lastName"
              name="lastName"
              defaultValue={prior?.lastName ?? ""}
              placeholder="Doe"
              required
              maxLength={50}
              autoComplete="family-name"
              className="field field-input has-icon"
            />
          </div>
        </div>
      </div>

      {/* Email + Phone row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="field-label">
            Email <span className="field-required">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              id="email"
              name="email"
              defaultValue={prior?.email ?? ""}
              type="email"
              placeholder="john@example.com"
              required
              maxLength={254}
              autoComplete="email"
              className="field field-input has-icon"
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="phone" className="field-label">
            Phone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              id="phone"
              name="phone"
              defaultValue={prior?.phone ?? ""}
              type="tel"
              placeholder="(555) 123-4567"
              maxLength={20}
              autoComplete="tel"
              inputMode="tel"
              className="field field-input has-icon"
            />
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="space-y-2.5">
        <Label htmlFor="service" className="field-label">
          Service you need
        </Label>
        <div className="relative">
        <Layers className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <select
          id="service"
          name="service"
          defaultValue={prior?.service ?? ""}
          className="field field-input has-icon appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.45)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat"
        >
          <option value="" disabled className="bg-[#0f1319] text-white/60">
            Select a service...
          </option>
          <option value="Real Estate" className="bg-[#0f1319]">Real estate</option>
          <option value="Personal Brand" className="bg-[#0f1319]">Personal brand / Content Creator Program</option>
          <option value="Commercial" className="bg-[#0f1319]">Commercial</option>
        </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2.5">
        <Label htmlFor="message" className="field-label">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          defaultValue={prior?.message ?? ""}
          placeholder="Any additional details..."
          rows={4}
          maxLength={5000}
          className="field field-area"
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400" aria-live="polite">
            {state.error}
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col-reverse gap-4 pt-0 sm:pt-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full sm:w-auto disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send message
              <ArrowRight className="arrow h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
