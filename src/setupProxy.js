const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
    app.use(
        createProxyMiddleware("/rest", {
            target: "https://api.setlist.fm",
            changeOrigin: true
        })
    );
};