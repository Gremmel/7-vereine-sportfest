import logger from '../logger.js';

const HomeView = {
  start () {
    logger.info('start in HomeView');
  },

  init (ioClient, payload) {
    logger.debug('init', payload);
    setTimeout(() => {
      ioClient.emit('initHome', {
        msg: 'Hallo vom Server'
      });
    }, 5000);
  }

};

HomeView.start();

export default HomeView;
