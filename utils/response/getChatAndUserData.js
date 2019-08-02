module.exports = function(utils) {
  // internal error message
  const internalError = "Internal error on server. Please, try again.";

  // handles chat load request
  return function(req, res) {
    // get id of the chat requested and some data
    utils.sql.getChatAndUserData(req, (err, chatId, chatAndUserInfo) => {

      if (err) {
        res.statusMessage = internalError;
        res.status(500).end();
        throw new Error(err);
      }

      // if no permission, return error to user
      if (!chatId || !chatAndUserInfo) {
        utils.logger.debug("No permission for chat");
        return res.status(401).end();
      }

      utils.logger.silly("Loading messages from chat " + chatId);

      // load messages
      utils.sql.selectNMessages(chatId, utils.defaultMessagesNum, (err, data) => {
        // if internal error, return error
        if (err) {
          res.statusMessage = internalError;
          res.status(500).end();
          throw new Error(err);
        }

        data = data.rows;

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