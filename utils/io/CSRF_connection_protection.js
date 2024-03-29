module.exports = function(utils) {
  const cookie = require('cookie');

  return function(socket, next) {
    let req = socket.request;
    req.query = req._query;
    req.cookies = cookie.parse(socket.handshake.headers.cookie);
    req.csrf_always_check = true;
    utils.csrfProtection(req, req.res, (err) => {
      if (err) {
        socket.disconnect(true);
        if (err.code !== 'EBADCSRFTOKEN') {
          console.log(err);
          utils.logger.error(err.stack);
        }
      } else {
        next()
      }
    });
  }
}