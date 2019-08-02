module.exports = function(utils, sql) {

  let addUserToChat = module.addUserToChat = function(userId, chatId, done) {
    const Query = utils.sql.Query;

    let query = [];
    query.push(new Query("BEGIN"));
    query.push(new Query("INSERT INTO chat_users (chat_id, user_id) VALUES ( $1, $2 );", [chatId, userId]));
    query.push(new Query("UPDATE chats SET num_of_users = num_of_users + 1 WHERE id = $1;", [chatId]));
    query.push(new Query("COMMIT"));

    // insert data in database and increase the counter for the chat users
    sql.multipleQuery(query, (err) => {
      if (err) {
        return done(err);
      }
      return done(null, true);

    });
  }

  // adds user to chat if he wasn't there already
  let addUserToChatIfNotAlready = module.addUserToChatIfNotAlready = function(userId, chatId, done) {
    sql.isUserInChat(userId, chatId, function(err, isInChat) {
      if (err) {
        return done(err, undefined);
      } else if (isInChat) {
        return done(null, false);
      } else {
        addUserToChat(userId, chatId, done);
      }
    })
  }

  return module;
}