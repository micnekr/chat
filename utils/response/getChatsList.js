module.exports = function (utils) {

    // handles chatsList request
    return function (req, res, next) {
        // get chats
        let query = `SELECT chats.name, chats.num_of_users, chats.id FROM ((chat_users
        INNER JOIN chats ON chat_users.chat_id=chats.id)
        Inner Join users ON chat_users.user_id=users.id)
        WHERE users.id=$1`;
        utils.sql.pool.query(query, [req.session.passport.user.id], (err, data) => {
            if (err) {
                return next(err);
            } else {
                return res.send(data.rows);
            }
        })
    }
};