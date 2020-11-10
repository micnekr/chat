module.exports = function (utils) {
    return function (chatId, done) {
        let query = `SELECT num_of_users
    FROM chats
    WHERE id=$1`;
        utils.sql.get(query, [chatId], function (err, data) {
            if (err) {
                return done(err);
            } else {
                return done(null, data.rows);
            }
        })
    }
};