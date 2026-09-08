# Signing in to the dashboard with Google

Ten minutes, once. Until it is done the dashboard keeps using the shared
password exactly as it does today, so there is no rush and nothing breaks
while it waits.

When it is done the password stops working. That is the point: leaving both
switched on would mean the dashboard's real security stayed whatever the
password's strength is.

## What you are creating

A thing Google calls an **OAuth client**. It is how Google knows which app is
asking, and which addresses to send people back to afterwards. It is free.

## Step 1, make a project

1. Go to https://console.cloud.google.com
2. Sign in as **pgcreativeswisconsin@gmail.com**
3. Top left, click the project dropdown, then **New project**
4. Name it `PG Creatives Dashboard`, then **Create**
5. Wait for it to finish, then make sure it is the selected project

## Step 2, the consent screen

This is the page people see when they sign in.

1. Left menu, **APIs and services**, then **OAuth consent screen**
2. User type: **External**, then **Create**
3. Fill in:
   - App name: `PG Creatives Dashboard`
   - User support email: `pgcreativeswisconsin@gmail.com`
   - Developer contact email: `pgcreativeswisconsin@gmail.com`
4. **Save and continue** through Scopes and Test users. Nothing to add on
   either: the dashboard only asks for your name and email address, which
   Google grants without any scope being listed.
5. On the summary, **Back to dashboard**

You do **not** need to publish the app or get it verified. Leave it in
Testing, and add yourself under **Test users**. A verified app is for
software strangers sign into; this one has an allowlist of one.

> If you skip the test user step, Google will refuse your own sign in with
> "app has not completed verification".

## Step 3, the OAuth client

1. Left menu, **APIs and services**, then **Credentials**
2. **Create credentials**, then **OAuth client ID**
3. Application type: **Web application**
4. Name: `Dashboard`
5. Under **Authorised redirect URIs**, click **Add URI** and add both of these,
   exactly, no trailing slash:

   ```
   https://pgcreativeswi.com/api/auth/google/callback
   http://localhost:3303/api/auth/google/callback
   ```

   The second one is only so the dashboard can be worked on locally. Google
   matches these character for character, so a typo here is the single most
   common reason this fails.

6. **Create**. Google shows a **Client ID** and a **Client secret**. Copy both.

## Step 4, hand them over

Send the client ID and secret to whoever is setting this up, or add them
yourself in Vercel under the `pgcreatives` project, Settings, Environment
Variables, Production:

| Name | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | the client ID from step 3 |
| `GOOGLE_CLIENT_SECRET` | the client secret from step 3 |
| `ADMIN_ALLOWED_EMAILS` | `pgcreativeswisconsin@gmail.com` |

`ADMIN_ALLOWED_EMAILS` is the list of Google accounts allowed in, separated by
commas. Adding somebody later is a change to that one variable and a redeploy,
never a code change.

Then redeploy. The sign in page will show a Google button instead of a
password box.

## If something goes wrong

The sign in page says what happened in plain words. The two you are most
likely to see:

- **"That account is not on the list"** means the Google account you used is
  not in `ADMIN_ALLOWED_EMAILS`. Check it for typos, and remember it is the
  address of the account you actually picked in the chooser, which may not be
  the one you expected.
- **"redirect_uri_mismatch"** shown by Google, before you get back to the
  site, means step 3's URI does not match. Compare it character for character,
  including `https` and the absence of a trailing slash.

## Getting back in if it all goes wrong

Remove `GOOGLE_CLIENT_ID` from Vercel and redeploy. The password comes back
immediately. Nothing about the leads, the emails or the alerts depends on any
of this.
