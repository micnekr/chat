module.exports = function(utils, sql) {

  // returns true if chat exsists, false if it does not
  return function(chatName, done) {
    let query = `SELECT id
    FROM chats
    WHERE name=$1`;
    sql.get(query, [chatName], function(err, data) {
      if (err) {
        return done(err);
      } else {
        return done(null, data.rows[0] !== undefined)
      }
    })
  }
}