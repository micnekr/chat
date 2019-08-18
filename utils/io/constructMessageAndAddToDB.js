module.exports = function(utils, maxChars) {

  let module = {};

  // adds incoming message to database and constructs message to be sent to other people in chat
  // (err, if had permission)
  return function(msg, req, done) {
    // chat id set by user
    let chatId = msg.chatId

    // check permission to send messages
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

      // if the message is empty or not a string, return and do not send it
      if (!msg.content || typeof msg.content !== 'string') {
        return done(undefined, undefined);
      }

      // get needed constants
      const user = msg.user;
      const time = Date.parse(new Date()) / 1000;
      if (msg.content.length > maxChars) {
        logger.silly("The message exceeds max char limit with num of chars: ", msg.content.length);
        return done(undefined, undefined);
      }
      let content = utils.xss(msg.content);

      // construct object of response
      let obj = {
        content: content,
        time: time,
        username: user.username
      };

      content = utils.messageEncrypt.encrypt(content);

      // add message to database
      utils.sql.pool.query("INSERT INTO messages (chat_id, user_id, time, content) VALUES ($1, $2, $3, $4);", [chatId, user.id, time, content], (err) => {
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