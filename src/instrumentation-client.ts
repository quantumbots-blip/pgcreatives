import { initBotId } from "botid/client/core";

/**
 * BotID runs its challenge on the page and attaches the result to requests
 * going to the paths named here. A path missing from this list means
 * checkBotId() on the server has nothing to read, so these two must stay in
 * step with wherever the contact form is mounted.
 *
 * A server action posts back to the page that invoked it, so the paths are
 * the two pages carrying the form, not the action itself.
 */
initBotId({
  protect: [
    { path: "/", method: "POST" },
    { path: "/contact", method: "POST" },
  ],
});
