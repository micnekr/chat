module.exports = function (utils) {
    return function (req, res, next) {
        let userId = req.session.passport.user.id;
        // get requests are not parsed for req.body object
        let chatId = req.query.chatId;

        //check if the user has right to see settings
        // also, get chat type and decide wether to show requests
        let query = `SELECT admission_type_id, admission_requests_count
                 FROM chats
                 WHERE id=$1 AND admin_id=$2`;
        utils.sql.pool.query(query, [chatId, userId], function (err, data) {
            if (err) return next(err);

            let row = data.rows[0];

            // if no permission, return an error
            if (!row) {
                res.statusMessage = "You have no permission to view this chat information";
                utils.logger.silly(res.statusMessage);
                return res.status(400).send(res.statusMessage);
            }

            // if no an open chat, return null
            if (row.admission_type_id === 0) {
                return res.send([]);
            }

            // get admissions requests: userId and username
            let query = `SELECT user_id, users.username
                   FROM chat_admission_requests
                   INNER JOIN users
                   ON chat_admission_requests.user_id=users.id
                   WHERE chat_admission_requests.chat_id=$1`;
            utils.sql.pool.query(query, [chatId], function (err, data) {
                if (err) return next(err);

                res.send(data.rows)
            })
        })
    }
};