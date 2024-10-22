module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Dein Express-API-Server
        changeOrigin: true,
        secure: false
      }
    }
  }
};
