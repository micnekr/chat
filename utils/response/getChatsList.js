module.exports = function(utils) {

  // handles chatsList request
  return function(req, res, next) {
    // get chats
    utils.sql.getChatsList(req.session.passport.user.id, (err, data) => {
      if (err) {
        throw new Error(err);
      } else {
        return res.send(data.rows);
      }
    })
  }
}