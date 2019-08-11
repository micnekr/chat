module.exports = function(utils) {
  return function(req, res, next) {
    let userId = req.session.passport.user.id;
    let chatId = req.body.chatId;

    // check if chat is open to everyone
    let query = `SELECT admission_type_id
    FROM chats
    WHERE id=$1`;
    utils.sql.get(query, [chatId], function(err, data) {
      if (err) return next(err);

      // if incorrect chat admission type, return error
      if (data.rows[0].admission_type_id !== 0) {
        res.statusMessage = "You can not join this chat";
        return res.send(res.statusMessage);
      }

      // else, add to chat
      utils.sql.addUserToChatIfNotAlready(userId, chatId, undefined, undefined, function(err, userWasAdded) {
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
    })
  }
}