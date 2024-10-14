import logger from './logger.js'; // Logger importieren
import { Server } from 'socket.io'; // socket.io importieren
import HomeView from './vueController/HomeView.js';

const socketIo = {
  server: undefined,
  io: undefined,
  clients: {},
  vueControllers: {},

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
        if (data.callFunction && typeof HomeView[data.callFunction] === 'function') {
          HomeView[data.callFunction](client, data.payload);
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
