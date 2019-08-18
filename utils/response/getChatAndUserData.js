module.exports = function(utils) {
  // internal error message
  const internalError = "Internal error on server. Please, try again.";

  // handles chat load request
  return function(req, res, next) {
    // get id of the user and chat the user tries to access
    const chatId = req.query.chatId;
    const userId = req.session.passport.user.id;

    // if data is wrong, get data
    // get id of the chat requested and some data
    utils.sql.userAndChatDataIfHasPermission(userId, chatId, (err, chatAndUserInfo) => {

      // throw errors
      if (err) {
        res.statusMessage = internalError;
        return next(err);
      }

      // if no permission, return error to user
      if (!chatId || !chatAndUserInfo) {
        utils.logger.silly("No permission for chat");
        return res.status(401).end();
      }

      // the user has permission
      utils.logger.silly("Loading messages from chat " + chatId);

      // load messages
      utils.sql.selectNMessages(chatId, utils.defaultMessagesNum, (err, data) => {
        // if internal error, return error
        if (err) {
          res.statusMessage = internalError;
          return next(err);
        }

        data = data.rows;

        // decrypt all messages
        for (let message of data) {
          message.content = utils.messageEncrypt.decrypt(message.content)
        }

        // send data
        return res.send({
          chatName: chatAndUserInfo.name,
          messages: data,
          header: 200,
          maxChars: utils.maxChars,
        });
      });
    });
  }
}