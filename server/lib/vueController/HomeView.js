import logger from '../logger.js';

const HomeView = {
  start () {
    logger.info('start in HomeView');
  },

  init (ioClient, payload) {
    logger.debug('init', payload);
    ioClient.emit('initHome', {
      msg: 'Hallo vom Server'
    });
  }

};

HomeView.start();

export default HomeView;
