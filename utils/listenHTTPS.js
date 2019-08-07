const fs = require('fs');
const https = require('https');

// set https options
let httpsOptions = {

  key: fs.readFileSync("data/keys/privatekey.pem"),

  cert: fs.readFileSync("data/keys/certificate.pem"),

  dhparam: fs.readFileSync("data/keys/dh-strong.pem")
};

module.exports = function(utils, port, app) {
  return https.createServer(httpsOptions, app);
}