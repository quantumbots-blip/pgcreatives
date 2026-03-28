"use client";

import { useState, useActionState, useRef } from "react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, User } from "lucide-react";

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

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple/20 to-purple-dim/10 border border-purple/20">
          <CheckCircle2 className="h-8 w-8 text-purple-light" />
        </div>
        <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours
          to discuss your project.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-8 rounded-lg border border-purple/25 bg-purple/10 px-6 py-2.5 text-sm tracking-wide text-purple-light transition-all hover:border-purple/40 hover:bg-purple/15"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6 sm:space-y-8">
      {/* Honeypot — hidden from humans, filled by bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Name row */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="firstName" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
            First Name <span className="text-purple-light/50">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple/40" />
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              required
              maxLength={50}
              className="h-12 rounded-lg border-purple/12 bg-[#040A2D]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="lastName" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
            Last Name <span className="text-purple-light/50">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple/40" />
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              required
              maxLength={50}
              className="h-12 rounded-lg border-purple/12 bg-[#040A2D]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Email + Phone row */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
            Email <span className="text-purple-light/50">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple/40" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              maxLength={254}
              className="h-12 rounded-lg border-purple/12 bg-[#040A2D]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
            Phone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple/40" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              maxLength={20}
              className="h-12 rounded-lg border-purple/12 bg-[#040A2D]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="space-y-2.5">
        <Label htmlFor="service" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
          Service Interested In
        </Label>
        <select
          id="service"
          name="service"
          defaultValue=""
          className="h-12 w-full rounded-lg border border-purple/12 bg-[#040A2D]/60 px-3.5 text-sm text-white focus:border-purple/40 focus:ring-1 focus:ring-purple/20 focus:outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(139%2C92%2C246%2C0.4)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
        >
          <option value="" disabled className="bg-[#040A2D] text-white/40">
            Select a service...
          </option>
          <option value="Real Estate Photography" className="bg-[#040A2D]">Real Estate Photography</option>
          <option value="Cinema Videography" className="bg-[#040A2D]">Cinema Videography</option>
          <option value="Drone Aerial" className="bg-[#040A2D]">Drone Aerial</option>
          <option value="3D Virtual Tours" className="bg-[#040A2D]">3D Virtual Tours</option>
          <option value="Commercial Branding" className="bg-[#040A2D]">Commercial Branding</option>
          <option value="Professional Editing" className="bg-[#040A2D]">Professional Editing</option>
          <option value="Full Listing Package" className="bg-[#040A2D]">Full Listing Package</option>
          <option value="Other" className="bg-[#040A2D]">Other</option>
        </select>
      </div>

      {/* Message */}
      <div className="space-y-2.5">
        <Label htmlFor="message" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Any additional details..."
          rows={4}
          maxLength={5000}
          className="rounded-lg border-purple/12 bg-[#040A2D]/60 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all resize-none"
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
      <div className="flex flex-col-reverse gap-4 pt-0 sm:pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-white/25 sm:text-left">
          We respond within 24 hours
        </p>
        <button
          type="submit"
          disabled={pending}
          className="glow-hover group flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-purple-dim via-purple to-purple-light px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
