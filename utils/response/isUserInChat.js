module.exports = function(utils) {
  return function(req, res) {
    utils.sql.isUserInChat(req.session.passport.user.id, req.query.chatId, (err, isUserInChat) => {
      if (err) {
        throw new Error(err);
      }
      res.send(isUserInChat);
    })
  }
}