"use client";

import { useState, useActionState, useRef, useEffect, useCallback } from "react";
import { submitContactForm, type ContactState } from "@/app/actions/contact";
import { readFirstTouch } from "@/lib/first-touch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const initialState: ContactState = { success: false, error: null };

/* Validation the page owns, rather than the browser.

   `required` and `type="email"` alone hand the visitor a bright orange
   system tooltip in the platform UI font, pointed at a field the fixed
   header may have just scrolled under. The attributes stay on the inputs,
   because that is what assistive technology reads and what the server-side
   check mirrors; the form carries `noValidate` so the browser stops drawing
   its own, and these rules draw ours. */
type Errors = Partial<Record<"firstName" | "lastName" | "email", string>>;

/* Deliberately permissive. This catches a typed mistake, not an invalid
   address: anything shaped like a@b.c gets through and the server decides. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(form: HTMLFormElement): Errors {
  const get = (name: string) =>
    String(new FormData(form).get(name) ?? "").trim();
  const errors: Errors = {};
  if (!get("firstName")) errors.firstName = "Tell us your first name.";
  if (!get("lastName")) errors.lastName = "Tell us your last name.";
  const email = get("email");
  if (!email) errors.email = "We need an email address to reply to.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";
  return errors;
}

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
  const [errors, setErrors] = useState<Errors>({});
  const prior = state.values;

  /* Re-check on submit, and from then on re-check a field as it is corrected
     so the message clears the moment it stops being true. Nothing is ever
     marked invalid before the visitor has tried to send: being told off for
     an empty field you have not reached yet is worse than no validation. */
  const [live, setLive] = useState(false);
  const recheck = useCallback(() => {
    if (!live || !formRef.current) return;
    setErrors(validate(formRef.current));
  }, [live]);

  /* A signed timestamp, fetched when the form mounts and sent back with the
     message. The gap between the two is how long somebody spent filling this
     in, which is the one thing that separates a person from a script posting
     at the endpoint. Both pages holding this form are cached, so the token
     cannot be rendered into the HTML: it would date the cache entry, not the
     visit. A failed fetch is not worth surfacing, the form still submits. */
  const [formToken, setFormToken] = useState("");
  /* Where this visit started, attached on the way out rather than mirrored
     into state on mount. sessionStorage is not readable while the server
     renders, so holding it in state would mean an effect writing state on
     every mount purely to carry a value the submit already has access to. */
  /* Validation gates the SUBMIT EVENT, not the action. A function action
     that returns without doing anything still counts as a completed action,
     and React resets an uncontrolled form when one completes: a visitor who
     mistyped their email would have watched the whole form empty itself.
     Preventing the event means the action never runs and nothing is reset. */
  function guard(event: React.FormEvent<HTMLFormElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }
    const form = event.currentTarget;
    const found = validate(form);
    setLive(true);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (!first) return;
    event.preventDefault();
    const el = form.elements.namedItem(first);
    if (el instanceof HTMLElement) {
      el.closest(".field-row")?.scrollIntoView({ block: "nearest" });
      el.focus({ preventScroll: true });
    }
  }

  function submitWithSource(formData: FormData) {
    const touch = readFirstTouch();
    if (touch) {
      /* "direct" rather than blank when somebody typed the address or
         followed a bookmark. Blank would be stored as null, which is also
         what every lead from before attribution existed looks like, and the
         dashboard would then report years of unknown arrivals as direct
         traffic it never measured. */
      formData.set("sourceReferrer", touch.referrer ?? "direct");
      formData.set("sourceLanding", touch.landing ?? "");
      formData.set("sourceCampaign", touch.campaign ?? "");
    }
    formAction(formData);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/form-token", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.token) setFormToken(data.token);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (state.success) {
    return (
      <div
        /* The form is replaced wholesale, so without this the change is
           silent and focus is nowhere. */
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={(el) => el?.focus()}
        className="flex flex-col items-center justify-center py-16 text-center outline-none sm:py-20"
      >
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
    <form
      ref={formRef}
      action={submitWithSource}
      noValidate
      onSubmit={guard}
      onInput={recheck}
      onChange={recheck}
      className="form-column space-y-6 sm:space-y-8"
    >
      {/* Honeypot, hidden from humans, filled by bots.

          Sized down to a pixel. A default text input is about 318px wide, and
          although this one is parked off-screen it still counted toward the
          card's min-content width — which pushed the card past the viewport
          at 320px the moment the type got a little wider. */}
      <div className="absolute -left-[9999px] w-px overflow-hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="w-px"
        />
      </div>

      <input type="hidden" name="formToken" value={formToken} readOnly />

      {/* Name row.

          No placeholders here. "John" and "Doe" repeated what the labels
          already said, and set in the same grey as a real value they read as
          a form somebody had started filling in. A placeholder earns its
          place only where the expected format is not obvious. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="field-row">
          <Label htmlFor="firstName" className="field-label">
            First name <span className="field-required">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={prior?.firstName ?? ""}
            required
            maxLength={50}
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className="field field-input"
          />
          <FieldError id="firstName-error" message={errors.firstName} />
        </div>
        <div className="field-row">
          <Label htmlFor="lastName" className="field-label">
            Last name <span className="field-required">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={prior?.lastName ?? ""}
            required
            maxLength={50}
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            className="field field-input"
          />
          <FieldError id="lastName-error" message={errors.lastName} />
        </div>
      </div>

      {/* Email + Phone row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="field-row">
          <Label htmlFor="email" className="field-label">
            Email <span className="field-required">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            defaultValue={prior?.email ?? ""}
            type="email"
            placeholder="you@brokerage.com"
            required
            maxLength={254}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="field field-input"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div className="field-row">
          <Label htmlFor="phone" className="field-label">
            Phone
          </Label>
          {/* 555-01xx is the reserved fictional range, so this cannot be
              mistaken for a number that reaches anybody. */}
          <Input
            id="phone"
            name="phone"
            defaultValue={prior?.phone ?? ""}
            type="tel"
            placeholder="(920) 555-0134"
            maxLength={20}
            autoComplete="tel"
            inputMode="tel"
            className="field field-input"
          />
        </div>
      </div>

      {/* Service */}
      <div className="field-row">
        <Label htmlFor="service" className="field-label">
          Service you need
        </Label>
        <select
          id="service"
          name="service"
          defaultValue={prior?.service ?? ""}
          className="field field-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.45)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat"
        >
          <option value="" disabled className="bg-[#0f1319] text-white/60">
            Select a service...
          </option>
          <option value="Real Estate" className="bg-[#0f1319]">Real estate</option>
          <option value="Personal Brand" className="bg-[#0f1319]">Personal brand / Content Creator Program</option>
          <option value="Commercial" className="bg-[#0f1319]">Commercial</option>
        </select>
      </div>

      {/* Message */}
      <div className="field-row">
        <Label htmlFor="message" className="field-label">
          Message
        </Label>
        {/* Says what is actually useful to send, instead of asking for
            "additional details" and leaving them to guess. */}
        <Textarea
          id="message"
          name="message"
          defaultValue={prior?.message ?? ""}
          placeholder="Property address, square footage, and when you need it."
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
        {/* `aria-disabled`, not `disabled`. A disabled button is removed from
            the tab order, so the moment the visitor pressed Send their focus
            was thrown to <body> and the pending and success states were
            announced to nobody. This keeps the focus ring where they left it
            and the guard below refuses the second submit. */}
        <button
          type="submit"
          aria-disabled={pending}
          /* min-w reserves the resting label's width. "Send message" is 38px
             wider than "Sending...", so the button used to shrink out from
             under the pointer at the moment it was pressed. */
          className="btn btn-primary w-full sm:w-auto sm:min-w-[11.5rem] aria-disabled:opacity-60 aria-disabled:pointer-events-none"
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

/* One shape for every field message, so they cannot drift apart. `aria-live`
   sits on the container rather than the text, so a message that appears
   after submit is announced and one that is simply absent costs nothing. */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="field-error" role="alert" aria-live="polite">
      {message ? (
        <>
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </>
      ) : null}
    </p>
  );
}
