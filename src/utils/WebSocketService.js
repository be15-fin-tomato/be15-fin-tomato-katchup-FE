
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null

export const connectWebSocket = (roomId, onMessage, token) => {
  const socket = new SockJS('https://api.tomato-katchup.xyz/api/v1/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: token,
    },
    onConnect: () => {
      stompClient.subscribe(`/topic/chatroom/${roomId}`, (message) => {
        onMessage(JSON.parse(message.body))
      })
    },
    debug: () => {},
  })
  stompClient.activate()
}

export const sendChatMessage = (roomId, payload) => {
  stompClient.publish({
    destination: '/app/chat/message',
    body: JSON.stringify(payload),
  })
}
