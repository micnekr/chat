module.exports = function(utils, sql) {
  let module = {};

  //gets all data about a user in users table.
  let loadUserData = module.loadUserData = function(username, done) {
    // make case insensitive
    username = username.toLowerCase();
    let query = `SELECT * FROM users
       WHERE LOWER(username)=$1`;
    return sql.get(query, [username], done);
  }

  // gets data about messages of chat
  // WARNING: not used yet
  let getChatMessages = module.getChatMessages = function(chatId, done) {
    let query = `SELECT time, content, username
                 FROM messages
                 LEFT JOIN users
                 ON messages.user_id=users.id
                 WHERE chat_id=$1`;
    return sql.pool.query(query, [chatId], done);
  }

  // gets a list of user's chats
  let getChatsList = module.getChatsList = function(userId, done) {
    // get chats
    let query = `SELECT chats.name, chats.num_of_users, chats.id FROM ((chat_users
        INNER JOIN chats ON chat_users.chat_id=chats.id)
        Inner Join users ON chat_users.user_id=users.ID)
        WHERE users.ID=$1`;

    return sql.pool.query(query, [userId], done);
  }

  return module;
}