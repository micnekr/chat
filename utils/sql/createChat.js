module.exports = function(utils) {

  let module = {};

  // returns chat's id
  let addChatWithoutCheck = module.addChatWithoutCheck = function(name, done) {
    let query = `INSERT INTO chats (name)
     VALUES ($1) RETURNING *`;
    utils.sql.pool.query(query, [name], function(err, data) {
      if (err) {
        return done(err);
      } else {
        return done(null, data.rows[0].id);
      }
    })
  }

  //creates chat with prior check of avaliability, returns a boolean if a new chat was created and the chat id
  let addChatIfNotExists = module.addChatIfNotExists = function(name, done) {
    utils.sql.checkIfChatExists(name, (err, ifChatExists) => {
      if (err) {
        return done(err);
      } else if (ifChatExists) {
        return done(err, false);
      } else {
        addChatWithoutCheck(name, (err, lastId) => {
          if (err) {
            return done(err);
          } else {
            return done(null, true, lastId)
          }
        })
      }
    });
  }

  return module;
}