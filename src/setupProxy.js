const { createProxyMiddleware } = require('http-proxy-middleware');
const REACT_APP_SERVER = process.env.REACT_APP_SERVER
module.exports = function(app) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: "https://localhost:7171",
      changeOrigin: true,
      secure: false,
    })
  );
};