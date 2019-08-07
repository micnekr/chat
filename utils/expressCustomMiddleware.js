module.exports = function(utils) {
  let module = {};

  module.isUserInChat = function(req, res, next) {
    utils.sql.isUserInChat(req.session.passport.user.id, req.query.chatId, (err, isUserInChat) => {
      if (err) {
        return next(err);
      }
      if (!req.hbs_options) req.hbs_options = {};
      req.isUserInChat = req.hbs_options.isUserInChat = isUserInChat;
      next();
    })
  }

  module.getNumberOfChatUsers = function(req, res, next) {
    utils.sql.getChatUsersNumber(req.query.chatId, function(err, rows) {
      if (err) {
        return next(err);
      }

      if (!rows[0]) {
        return next(new Error("Chat with id" + creq.query.chatId + " not found"))
      }

      if (!req.hbs_options) req.hbs_options = {};
      req.chatUsersNum = req.hbs_options.chatUsersNum = rows[0].num_of_users;
      next();
    })
  }

  return module;
}