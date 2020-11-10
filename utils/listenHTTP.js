const http = require('http');

module.exports = function (utils, port, app) {
    return http.createServer(app);
};