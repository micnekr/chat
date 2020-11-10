module.exports = function (utils, sql) {

    //returns username, chat name and their ids if user has permission. otherwise, returns false.
    return function (userId, chatId, done) {

        // gets user id, chat id, username and chat name
        let query = `SELECT user_id, chat_id, chats.name, users.username FROM ((chat_users
      INNER JOIN chats ON chat_users.chat_id=chats.id)
      Inner Join users ON chat_users.user_id=users.ID)
      WHERE user_id=$1 AND chat_id=$2`;
        return sql.get(query, [userId, chatId], (err, data) => {
            if (err) {
                return done(err);
            }
            let row = data.rows[0];
            if (row) {
                done(null, row);
            } else {
                // if no permission, return false
                done(null, false);
            }
        });
    }
};