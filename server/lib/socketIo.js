import homeView from './vueController/HomeView.js';
import logger from './logger.js'; // Logger importieren
import { Server } from 'socket.io'; // socket.io importieren

const socketIo = {
  server: undefined,
  io: undefined,
  clients: {},

  init (server) {
    this.server = server;

    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: [ 'GET', 'POST' ]
      }
    });

    this.io.on('connection', (client) => {
      this.clients[client.id] = client;

      client.on('HomeView', (data) => {
        logger.info('homeView data', data);
        if (data.callFunction && typeof homeView[data.callFunction] === 'function') {
          homeView[data.callFunction](client, data.payload);
        }
      });

      logger.info('io connection', client.id);

      client.on('disconnect', () => {
        delete this.clients[client.id];
        logger.info('client disconnect', client.id);
      });
    });
  }
};

export default socketIo;
