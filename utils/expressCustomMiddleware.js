const request = require('request');

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

  module.verifyCaptcha = function(req, res, next) {
    if (!req.body.captchaToken) {
      res.statusMessage = "Something went wrong with captcha";
      return res.status(400).send(res.statusMessage);
    }

    const secretKey = "6LffILcUAAAAAPXV4QnNAjlY2-mcSpAXtN0htn5I";

    // query string
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" +
      secretKey + "&response=" + req.body.captchaToken + "&remoteip=" + req.ip;

    request(verificationURL, function(err, response, body) {
      if (err) return next(err);
      body = JSON.parse(body);

      if (body["error-codes"]) {
        res.statusMessage = "Something went wrong with captcha";
        return res.status(400).send(res.statusMessage);
      }

      if (!body.success) {
        utils.logger.warn("A bot trying to solve captcha");
        res.statusMessage = "You appear to be a bot. Please, try signing up later.";
        return res.status(400).send(res.statusMessage);
      }
      next();
    });
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