/* Service worker for the PG Creatives dashboard.
 *
 * Two jobs and nothing else. It receives the push that says a lead came in,
 * and it opens the dashboard when that notification is tapped. It does not
 * cache anything: a dashboard showing yesterday's leads because a service
 * worker served them from disk would be worse than one that needs a network.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "New lead";
  const options = {
    body: data.body || "Somebody just filled in the contact form.",
    icon: "/app-icon-192.png",
    badge: "/app-icon-192.png",
    // Same tag means a second lead replaces the first rather than stacking,
    // and renotify makes the phone buzz for the replacement anyway.
    tag: data.tag || "pg-lead",
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || "/admin" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Focus the dashboard if it is already open rather than stacking a
      // second copy of it on top of the first.
      for (const client of windows) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
