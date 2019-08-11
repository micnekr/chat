module.exports = function(utils) {
  return function(req, res, next) {
    let notificationsNum = {
      total: 0
    };
    let userId = req.session.passport.user.id;

    //check for chat admisssion requests
    let query = `SELECT SUM(admission_requests_count) AS total
    FROM chats
    WHERE admin_id=$1;`;
    utils.pool.query(query, [userId], function(err, data) {
      if (err) return next(err);

      // add to notificationsNum
      notificationsNum.chatAdmissionRequests = Number(data.rows[0].total || 0);
      notificationsNum.total += notificationsNum.chatAdmissionRequests;

      return res.send(notificationsNum)
    })
  }
};