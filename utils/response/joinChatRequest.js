module.exports = function(utils) {
  return function(req, res) {
    let userId = req.session.passport.user.id;
    let chatId = req.cookies.chatIdToViewInfo;
    utils.sql.addUserToChatIfNotAlready(userId, chatId, function(err, userWasAlreadyInChat) {
      if (err) {
        throw new Error(err);
      } else {
        if (!userWasAlreadyInChat) {
          utils.logger.silly("User already in chat");
          return res.send("The user was already in chat");
        }
        res.send("Success");
      }
    })
  }
}