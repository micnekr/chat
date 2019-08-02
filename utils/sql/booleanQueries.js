module.exports = function(utils, sql) {
  let module = {};

  // check if user is already in the chat
  module.isUserInChat = function(userId, chatId, done) {
    sql.get("SELECT * FROM chat_users WHERE user_id=$1 AND chat_id=$2", [userId, chatId], function(err, data) {
      if (err) {
        return done(err, null);
      } else if (data.rows[0] !== undefined) {
        return done(null, true);
      } else {
        return done(null, false);
      }
    })
  }

  return module;
}