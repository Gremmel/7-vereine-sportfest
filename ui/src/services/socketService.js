// src/services/socketService.js

import { io } from 'socket.io-client';

class SocketService {
  socket;

  // Initialisierung des Sockets
  constructor() {
    // dev
    this.socket = io('http://192.168.201.42:3000'); // Server-URL anpassen

    // production
    // this.socket = io();
  }

  // Beispiel-Methode zum Senden von Nachrichten
  sendMessage(eventName, message) {
    this.socket.emit(eventName, message);
  }

  // Beispiel-Methode zum Empfangen von Nachrichten
  onMessage(eventName, callback) {
    this.socket.on(eventName, callback);
  }

  // Socket-Verbindung trennen
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

const socketService = new SocketService();
export default socketService;
