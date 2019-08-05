module.exports = function(utils, maxChars) {
  // adds incoming message to database and constructs message to be sent to other people in chat
  return function(msg, req, done) {
    let chatId = msg.chatId
    // get chat id
    utils.sql.isUserInChat(req.session.passport.user.id, chatId, (err, permission) => {

      // if an error, return error
      if (err) {
        return done(err, null);
      }

      // if no permission, return
      if (!permission) {
        utils.logger.debug("No permission");
        return done(undefined, false);
      }

      // get needed constants
      const user = msg.user;
      const time = Date.parse(new Date()) / 1000;
      if (msg.content.length > maxChars) {
        logger.silly("The message exceeds max char limit with num of chars: ", msg.content.length);
        return done(undefined, undefined);
      }
      let content = utils.xss(msg.content);
      const userId = user.id;

      // if the message is empty, return and do not send it
      if (!content) {
        return done(undefined, undefined);
      }

      // construct object of response
      let obj = {
        content: content,
        time: time,
        username: user.username
      };

      content = utils.messageEncrypt.encrypt(content);

      // add message to database
      utils.sql.pool.query("INSERT INTO messages (chat_id, user_id, time, content) VALUES ($1, $2, $3, $4);", [chatId, userId, time, content], (err) => {
        //internal error
        if (err) {
          return done(err, null);
        }
        // return object
        return done(undefined, obj);
      });
    });
  }
}