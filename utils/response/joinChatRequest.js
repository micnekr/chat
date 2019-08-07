module.exports = function(utils) {
  return function(req, res, next) {
    let userId = req.session.passport.user.id;
    let chatId = req.body.chatId;
    utils.sql.addUserToChatIfNotAlready(userId, chatId, function(err, userWasAdded) {
      if (err) {
        return next(err);
      } else {
        if (!userWasAdded) {
          utils.logger.silly("User already in chat");
          res.statusMessage = "The user was already in chat";
          return res.send("The user was already in chat");
        }
        res.send("Success");
      }
    })
  }
}