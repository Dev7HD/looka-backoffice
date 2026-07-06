/* Firebase Cloud Messaging — background handler for the back-office web app.
   Config is passed as query params at registration time (see fcm.ts), so no
   build-time injection is needed. Uses the compat SDK required by SW scope. */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

const cfg = Object.fromEntries(new URL(location).searchParams.entries());

if (cfg.apiKey && cfg.projectId) {
  firebase.initializeApp(cfg);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || "Loüka · Admin";
    const options = {
      body: (payload.notification && payload.notification.body) || "",
      icon: "/favicon.svg",
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });
}

// Focus/open the app when a notification is clicked.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const client = clients.find((c) => "focus" in c);
      if (client) return client.focus();
      return self.clients.openWindow("/");
    })
  );
});
