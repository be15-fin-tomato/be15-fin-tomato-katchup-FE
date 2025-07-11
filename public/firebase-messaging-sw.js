/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBOnX8kKdcvIdtdwJ2O4-mbQwxaQGuZtwA",
  messagingSenderId: "101664121020",
  projectId: "tomato-katchup",
  appId: "1:101664121020:web:525beb263a7bbdbc7530b9",
  authDomain:"tomato-katchup.firebaseapp.com",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('📦 백그라운드 메시지 수신:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/tomato.png',
  });
});
