module.exports = function(utils, sql) {
  const cookie = require('cookie');

  const logger = utils.logger;

  let module = {};

  // returns chat id, user id, chat name and username
  let getChatAndUserData = module.getChatAndUserData = function(req, done) {
    // get id of the user and chat the user tries to access
    const chatId = req.query.chatId;
    const userId = req.session.passport.user.id;

    // if data is wrong, get data
    sql.userAndChatDataIfHasPermission(userId, chatId, (err, data) => {
      // log errors
      if (err) {
        return done(err, null);
      }
      // if permitted, cache data and return it
      if (data) {
        // return data
        return done(null, chatId, data);
      } else {
        // no permission, return false
        return done(null, false);
      }
    });
  }

  return module;
}