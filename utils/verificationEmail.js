module.exports = function(utils) {
  let module = {};

  const fs = require('fs');
  const NodeCache = require("node-cache");
  const validator = require('validator');
  const crypto = require("crypto");
  const mailjet = require('node-mailjet').connect('2cf55dcfadfe93a159a0b7f0ac393b30', 'e46cfdad0ce96e3a7dd8191cd4e30300');


  const verificationCodes = new NodeCache({
    stdTTL: utils.timeForEmailVerification,
    checkperiod: utils.timeForEmailVerification
  });

  // setup sendjet
  const sender = mailjet.post("send", {
    'version': 'v3.1'
  });
  const verificationHTML = fs.readFileSync("./views/verificationEmail.html", "utf8");



  module.sendEmail = function(req, res, next) {
    let email = req.query.email;
    if (!email) {
      // redirect to login to supply the email
      utils.logger.warn("No email specified for verification")
      return res.redirect("login");
    }

    if (!validator.isEmail(email)) {
      utils.logger.warn("Not an email");
      return res.redirect("login"); // TODO: change redirect
    }

    crypto.randomBytes(48, function(err, buffer) {

      if (err) {
        return next(err);
      }

      var token = buffer.toString('hex');
      let obj = {
        email: email
      };

      verificationCodes.set(token, obj, function(err, success) {

        if (err) {
          return next(err);
        }

        let request = sender.request({
          "Messages": [{
            "From": {
              "Email": "no-reply@ibdc.ru",
              "Name": "Email verification"
            },
            "To": [{
              "Email": email,
            }],
            "Subject": "Please, verify your email",
            "TextPart": 'Please, go to "http://localhost:8124/email_confirmation_link?token=' + token + '" (without the quotes)', // TODO: replace url
            "HTMLPart": verificationHTML,
            "TemplateLanguage": true,
            "Variables": {
              token: token,
            }
          }]
        })
        request.then((result) => {
            utils.logger.debug("Confirmation email sent");
            return next();
          })
          .catch((err) => {
            return next(err);
          })
      });
    });
  }

  module.verifyEmail = function(req, res, next) {
    let token = req.query.token;
    if (!token) {
      res.statusMessage = "No token supplied";
      return res.status(400).send(res.statusMessage);
    }



    verificationCodes.get(token, function(err, value) {
      if (err) {
        return next(err);
      }

      if (value) {

        // the email is now verified
        verificationCodes.del(token, function(err, count) {
          if (err) {
            return next(err);
          }

          // add this option. add options object if needed
          if (!req.hbs_options) req.hbs_options = {};
          req.isCorrectToken = req.hbs_options.isCorrectToken = true;

          utils.sql.pool.query("UPDATE users SET verified=true WHERE LOWER(email)=$1", [value.email.toLowerCase()], function(err, data) {
            if (err) {
              return done(err);
            }

            // if someone exists
            if (data.rowCount == "1") {
              return next();

              // otherwise
            } else {
              res.statusMessage = "This email is not used by any accounts";
              return res.status(400).send(res.statusMessage);
            }
          })
        })


      } else {
        // wrong token

        // add this option. add options object if needed
        if (!req.hbs_options) req.hbs_options = {};
        req.isCorrectToken = req.hbs_options.isCorrectToken = false;
        return next();
      }
    });
  }

  return module;
}