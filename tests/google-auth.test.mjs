import { test } from "node:test";
import assert from "node:assert/strict";
import {
  googleConfigured,
  allowedEmails,
  isAllowed,
  redirectUri,
  beginHandshake,
  statesMatch,
  FAILURE_MESSAGE,
} from "../src/lib/google-auth.ts";

const withEnv = (vars, fn) => {
  const saved = { ...process.env };
  Object.assign(process.env, vars);
  try {
    return fn();
  } finally {
    for (const k of Object.keys(vars)) delete process.env[k];
    Object.assign(process.env, saved);
  }
};

test("dormant until both keys exist", () => {
  withEnv({ GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" }, () =>
    assert.equal(googleConfigured(), false, "off with nothing set"),
  );
  withEnv({ GOOGLE_CLIENT_ID: "abc", GOOGLE_CLIENT_SECRET: "" }, () =>
    assert.equal(googleConfigured(), false, "half configured must stay off"),
  );
  withEnv({ GOOGLE_CLIENT_ID: "abc", GOOGLE_CLIENT_SECRET: "shh" }, () =>
    assert.equal(googleConfigured(), true),
  );
});

test("the allowlist fails closed and ignores case and spacing", () => {
  withEnv({ ADMIN_ALLOWED_EMAILS: "" }, () => {
    assert.deepEqual(allowedEmails(), [], "empty means nobody");
    assert.equal(isAllowed("anyone@gmail.com"), false, "nobody gets in on an empty list");
  });
  withEnv({ ADMIN_ALLOWED_EMAILS: " Owner@Gmail.com , second@gmail.com ,, " }, () => {
    assert.deepEqual(allowedEmails(), ["owner@gmail.com", "second@gmail.com"]);
    assert.equal(isAllowed("OWNER@gmail.com"), true, "case must not matter");
    assert.equal(isAllowed(" owner@gmail.com "), true, "spacing must not matter");
    assert.equal(isAllowed("someone@gmail.com"), false);
    assert.equal(isAllowed("owner@gmail.com.evil.com"), false, "no partial matching");
    assert.equal(isAllowed(""), false);
  });
});

test("the redirect uri follows the origin it was reached on", () => {
  assert.equal(
    redirectUri("https://pgcreativeswi.com"),
    "https://pgcreativeswi.com/api/auth/google/callback",
  );
  assert.equal(
    redirectUri("http://localhost:3303"),
    "http://localhost:3303/api/auth/google/callback",
  );
});

test("the handshake carries state and a PKCE challenge, fresh every time", () => {
  withEnv({ GOOGLE_CLIENT_ID: "client-123", GOOGLE_CLIENT_SECRET: "shh" }, () => {
    const a = beginHandshake("https://pgcreativeswi.com");
    const b = beginHandshake("https://pgcreativeswi.com");

    assert.notEqual(a.state, b.state, "state must not repeat");
    assert.notEqual(a.verifier, b.verifier, "verifier must not repeat");
    assert.ok(a.state.length >= 32 && a.verifier.length >= 43, "too little entropy");

    const url = new URL(a.url);
    assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
    assert.equal(url.searchParams.get("client_id"), "client-123");
    assert.equal(url.searchParams.get("response_type"), "code");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    assert.equal(url.searchParams.get("state"), a.state);
    assert.equal(
      url.searchParams.get("redirect_uri"),
      "https://pgcreativeswi.com/api/auth/google/callback",
    );
    // The verifier itself must never travel to Google, only its hash.
    assert.ok(!a.url.includes(a.verifier), "the verifier leaked into the url");
    assert.ok(url.searchParams.get("code_challenge"), "no challenge");
    assert.notEqual(url.searchParams.get("code_challenge"), a.verifier);
  });
});

test("state comparison rejects anything that is not an exact match", () => {
  const s = "abcdef0123456789";
  assert.equal(statesMatch(s, s), true);
  assert.equal(statesMatch(s, "abcdef0123456780"), false);
  assert.equal(statesMatch(s, s + "x"), false, "different lengths must not throw");
  assert.equal(statesMatch("", ""), true);
  assert.equal(statesMatch(s, ""), false);
});

test("every failure reason has wording a person can read", () => {
  const reasons = [
    "not_configured", "bad_state", "exchange_failed", "no_id_token", "malformed_id_token",
    "bad_issuer", "bad_audience", "expired", "no_email", "unverified_email",
    "not_allowed", "no_allowlist", "denied",
  ];
  for (const r of reasons) {
    assert.ok(FAILURE_MESSAGE[r], `no message for ${r}`);
    assert.ok(!/[–—]/.test(FAILURE_MESSAGE[r]), `${r} carries a dash`);
    // Never name the mechanism at somebody probing the login page.
    assert.ok(!/token|oauth|jwt/i.test(FAILURE_MESSAGE[r]) || r.includes("token"), `${r} leaks mechanics`);
  }
});
