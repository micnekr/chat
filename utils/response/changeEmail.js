module.exports = function(utils) {

  const validator = require('validator');

  return function(req, res, next) {
    let email = req.body.email;
    // check if there is an email supplied
    if (!email) {
      res.statusMessage = "Please, specify an email";
      return res.status(400).send(res.statusMessage);
    }

    if (!validator.isEmail(email)) {
      res.statusMessage = "The email does not seem correct";
      return res.status(400).send(res.statusMessage);
    }

    // check if noone uses the same email
    utils.sql.isEmailUsedByOtherUsers(email, req.session.passport.user.username, function(err, isEmailUsed) {
      if (err) {
        return next(err);
      }

      if (isEmailUsed) {
        res.statusMessage = "This email is already used by another user.";
        return res.status(400).send(res.statusMessage);
      }

      utils.sql.pool.query("UPDATE users SET email=$1, verified=false WHERE LOWER(username)=$2", [email, req.session.passport.user.username.toLowerCase()], function(err, done) {
        if (err) {
          return next(err);
        }
        res.end();
      })
    })
  }
}