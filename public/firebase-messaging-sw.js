/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBOnX8kKdcvIdtdwJ2O4-mbQwxaQGuZtwA",
  messagingSenderId: "101664121020",
  projectId: "tomato-katchup",
  appId: "1:101664121020:web:525beb263a7bbdbc7530b9",
  authDomain: "tomato-katchup.firebaseapp.com",
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // 브라우저가 자동 생성한 알림에는 data.url이 없을 수도 있음
  const targetUrl = 'https://tomato-katchup.xyz/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
