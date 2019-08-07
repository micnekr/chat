module.exports = function(utils) {
  const internalErrorMessage = "Internal error on server. Please, try again.";
  const nameExistsMessage = "A chat with the same name already exists. Please, choose a different name."

  return function(req, res) {
    // get data from request
    let settings = req.body;
    let userId = req.session.passport.user.id;

    if (utils.maxChatNameLength < settings.chatName.length) {
      res.statusMessage = `The maximum length of a chat name is ${utils.maxChatNameLength} characters. You typed in ${settings.chatName.length} characters.`
      return res.status(400).end();
    }

    // add a chat
    utils.sql.addChatIfNotExists(settings.chatName, (err, uniqueName, chatId) => {
      if (err) {
        res.statusMessage = internalErrorMessage;
        return next(err);
      } else {
        if (!uniqueName) {
          res.statusMessage = nameExistsMessage;
          return res.status(400).end();
        } else {
          utils.sql.addUserToChatIfNotAlready(userId, chatId, (err) => {
            if (err) {
              res.statusMessage = internalErrorMessage;
              return next(err);
            }
            res.send("Success");
          })
        }
      }
    })
  }
}