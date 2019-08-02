module.exports = function(utils) {
  const async = require('async');
  let module = {}

  module.query = function query(commands, done) {
    commands[commands.length - 1].__last = true;
    async.each(commands, oneQuery, function(err) {
      if (err) {
        if (err.break) {
          return done(null);
        } else {
          return done(err);
        }
      };
    });
  }

  function oneQuery(command, done) {
    if (command.__last) {
      // Break out of async
      let err = new Error('Broke out of async');
      err.break = true;
      return done(err);
    }
    let query = command.text;
    let params = command.values || [];
    utils.pool.query(query, params, done)
  }

  module.Query = function Query(text, values) {
    this.text = text;
    this.values = values;
  }

  return module;
}