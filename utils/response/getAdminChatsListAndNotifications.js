module.exports = function (utils) {
    return function (req, res, next) {
        let userId = req.session.passport.user.id;

        let query = `SELECT admission_requests_count, name, id
                 FROM chats
                 WHERE admin_id=$1`;
        utils.sql.pool.query(query, [userId], function (err, data) {
            if (err) return next(err);

            return res.send(data.rows);
        })
    }
};