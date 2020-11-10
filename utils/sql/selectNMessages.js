module.exports = function (utils) {
    return function selectNMessages(chatId, N, done) {

        let query = `SELECT time, content, username, verified
             FROM messages
             LEFT JOIN users
             ON messages.user_id=users.id
             WHERE chat_id=$1
             ORDER BY messages.id DESC
             LIMIT $2`;
        utils.sql.pool.query(query, [chatId, N], done);
    }
};