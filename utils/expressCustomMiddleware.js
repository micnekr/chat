module.exports = function(utils) {
  let module = {};

  module.isUserInChat = function(req, res, next) {
    utils.sql.isUserInChat(req.session.passport.user.id, req.query.chatId, (err, isUserInChat) => {
      if (err) {
        return next(err);
      }
      // add this option. add options object if needed
      if (!req.hbs_options) req.hbs_options = {};
      req.isUserInChat = req.hbs_options.isUserInChat = isUserInChat;
      next();
    })
  }

  module.getNumberOfChatUsersAndChatAdmissionType = function(req, res, next) {
    let query = `SELECT num_of_users, admission_type_id
      FROM chats
      WHERE id=$1`
    utils.sql.get(query, [req.query.chatId], function(err, data) {
      if (err) {
        return next(err);
      }

      let rows = data.rows;

      // quit if no permission
      if (!rows[0]) {
        return next(new Error("Chat with id" + creq.query.chatId + " not found"))
      }

      // add this options. add options object if needed
      if (!req.hbs_options) req.hbs_options = {};
      req.chatUsersNum = req.hbs_options.chatUsersNum = rows[0].num_of_users;
      req.admissionTypeId = req.hbs_options.admissionTypeId = rows[0].admission_type_id;
      next();
    })
  }

  return module;
}