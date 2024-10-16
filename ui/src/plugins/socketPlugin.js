import socketService from '@/services/socketService';

export default {
  install: (app) => {
    app.config.globalProperties.$socket = socketService;
  },
};