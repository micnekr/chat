module.exports = function(utils, saltRounds, publicChatId, joinPublicChat) {

  // internal error message
  const internalError = "Internal error on server. Please, try again later.";

  const validator = require('validator');

  let module = {};

  const logger = utils.logger;
  const sql = utils.sql;
  const bcrypt = utils.bcrypt;
  const xss = utils.xss;

  function addUserToDB(req, res, next) {
    // get password hash
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // internal error
      if (err) {
        res.statusMessage = internalError;
        return next(err);
      }

      // reserve a client
      // do not forget to call done even in case of error
      utils.sql.pool.connect(function(err, client, done) {
        if (err) {
          done()
          return next(err);
        }

        // add username, hash and password in the table
        client.query("INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING *;", [req.body.username, hash, req.body.email], function(err, rows) {
          if (err) {
            res.statusMessage = internalError;
            done();
            return next(err);
          }

          // if need to add public chat
          if (joinPublicChat) {
            // add to chat and end the request
            sql.addUserToChatIfNotAlready(rows.rows[0].id, publicChatId, client, done, (err) => {
              if (err) {
                // sql.addUser... adds done() automatically in case of error
                res.statusMessage = internalError;
                return next(err);
              }
              done();
              res.end()
            });
            // else, just end the request
          } else {
            done();
            res.end();
          }
        });
      });
    });
  }

  let signUp = module.signUp = function(req, res, next) {

    // if not enough data, end request with an error
    if (!req.body.username || !req.body.password || !req.body.email) {
      logger.debug("Not enough data to add user");
      res.statusMessage = "Not enough data to add user. Please, fill out all text spaces.";
      return res.status(400).end();
    }

    // check username characters
    if (!utils.usernameRegex.test(req.body.username)) {
      res.statusMessage = "A username can only contain english alphabet letters, numbers, spaces and undersores.";
      return res.status(400).end();
    }

    // check the username length
    if (req.body.username.length > utils.maxUsernameSymbols) {
      res.statusMessage = `The username should not be longer than ${utils.maxUsernameSymbols} symbols long.`;
      return res.status(400).end();
    }

    if (req.body.email.length > utils.maxEmailSymbols) {
      res.statusMessage = `An email should not be longer than ${utils.maxEmailSymbols} symbols long`;
      return res.status(400).end();
    }

    // remove XSS in username and email
    req.body.username = xss(req.body.username);
    req.body.email = xss(req.body.email);

    // check if username is already used
    sql.loadUserData(req.body.username, (err, user) => {
      // internal error
      if (err) {
        res.statusMessage = internalError;
        return next(err);
      }

      //if user already exists
      if (user.rows[0]) {
        logger.debug("User already exists");
        res.statusMessage = "User with this username already exists. Please, try a different username.";
        return res.status(400).end();
      }

      if (!validator.isEmail(req.body.email)) {
        res.statusMessage = "The email has invalid format";
        return res.status(400).end();
      }

      // check if email exists
      sql.isEmailUsed(req.body.email, function(err, isEmailUsed) {
        if (err) {
          res.statusMessage = internalError;
          return next(err);
        }

        if (isEmailUsed) {
          res.statusMessage = "This email is already used.";
          return res.status(400).end();
        }
        addUserToDB(req, res, next);
      })
    });
  }

  return module;
}