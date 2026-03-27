"use client";

import { useActionState, useRef } from "react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, User } from "lucide-react";

const initialState: ContactState = { success: false, error: null };

export function ContactForm() {
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
          onClick={() => window.location.reload()}
          className="mt-8 rounded-lg border border-purple/25 bg-purple/10 px-6 py-2.5 text-sm tracking-wide text-purple-light transition-all hover:border-purple/40 hover:bg-purple/15"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
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
              className="h-12 rounded-lg border-purple/12 bg-[#080820]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
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
              className="h-12 rounded-lg border-purple/12 bg-[#080820]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
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
              className="h-12 rounded-lg border-purple/12 bg-[#080820]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
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
              className="h-12 rounded-lg border-purple/12 bg-[#080820]/60 pl-11 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="space-y-2.5">
        <Label htmlFor="service" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
          Service Interested In
        </Label>
        <Input
          id="service"
          name="service"
          placeholder="e.g. Real Estate Photography, Drone Aerial, Branding"
          className="h-12 rounded-lg border-purple/12 bg-[#080820]/60 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all"
        />
      </div>

      {/* Message */}
      <div className="space-y-2.5">
        <Label htmlFor="message" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
          Tell Us About Your Project <span className="text-purple-light/50">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Describe your project, timeline, and any specific requirements..."
          rows={5}
          required
          className="rounded-lg border-purple/12 bg-[#080820]/60 text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20 transition-all resize-none"
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
      <div className="flex items-center justify-between pt-2">
        <p className="hidden text-xs text-white/25 sm:block">
          We respond within 24 hours
        </p>
        <button
          type="submit"
          disabled={pending}
          className="glow-hover group flex items-center gap-3 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054] transition-all hover:bg-white/90 disabled:opacity-60 disabled:hover:bg-white"
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
