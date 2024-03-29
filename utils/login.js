module.exports = function(utils, maxAge, publicChatId) {
  let module = {};

  const logger = utils.logger;
  const sql = utils.sql;
  const bcrypt = utils.bcrypt;
  const passport = utils.passport;

  // information about errors
  const internalError = {
    errorMessage: "Internal error on server. Please, try again.",
    errorCode: 500
  };
  const wrongDetails = {
    errorMessage: "Wrong details",
    errorCode: 400
  };


  // called to check password with passport.js
  let checkPasswordForPassport = module.checkPasswordForPassport = function(username, password, done) {
    let userExists = true;

    // get user data
    sql.loadUserData(username, (err, user) => {
      // internal error
      if (err) {
        return done(err, false, internalError);
      }

      let passwordHash;

      // User not found
      // still check so the timing is not different

      if (user.rowCount === 0) {
        userExists = false;
        user = {};
        // wrong password hash
        passwordHash = "$2b$12$5uHSkKjNrQL0ZT.HOSxkkOSQEUMc9cmkZvwXaLkvwNCRzIgNxHaaa";
        logger.debug("No such user");
      } else {
        passwordHash = user.rows[0].password_hash;
      }

      //compare hashes
      bcrypt.compare(password, passwordHash, (err, isValid) => {
        // internal error
        if (err) {
          return done(err, false, internalError);
        }

        // user does not exist, but check is done for the correct timing
        if (!userExists) {
          return done(null, false, wrongDetails);
        }

        // wrong password
        if (!isValid) {
          logger.debug("Wrong password");
          return done(null, false, wrongDetails);
        }

        user = user.rows[0];

        let passportUserObject = {
          id: user.id,
          verified: user.verified,
          username: user.username,
          email: user.email
        }

        // correct details
        logger.silly("Login successful");
        return done(null, passportUserObject);
      });
    });
  }

  // login request
  let loginRequest = module.loginRequest = function(req, res, next) {
    // use passport to authenticate
    passport.authenticate('local', (err, user, info) => {
      // if an internal error, log it.
      if (err) {
        logger.error(err.stack);
        console.log(err);
        res.statusMessage = internalError.errorMessage
        return res.status(500).send(internalError.errorMessage);
      }

      // if not suitable password, return error message
      if (!user) {
        res.statusMessage = info.errorMessage
        return res.status(info.errorCode).send(info.errorMessage);
      }

      //log in the user
      req.logIn(user, function(err) {

        // if, internal error, skip to next modules
        if (err) {
          return next(err);
        }
        // set cookies of username and current chat
        setCookie("username", req.session.passport.user.username, res);
        setCookie("email", req.session.passport.user.email, res);

        // return success
        return res.end();
      });
    })(req, res, next);
  }

  // function to set cookies
  function setCookie(header, value, res) {

    // a bug does not let even set maxAge to undefined
    let options = {};
    if (maxAge) {
      options.maxAge = maxAge;
    }
    return res.cookie(header, value, options);
  }

  return module;
}