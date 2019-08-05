module.exports = function(utils) {
  return function(req, res, next) {

    // do not logout remember me
    if (req.cookies["rememberMe"] === "true" && !req.logoutAnyway) {
      return next();
    }


    // clear cookies
    for (let cookieName of Object.keys(req.cookies)) {
      if (!utils.cookiesNotToDeleteOnLogout.includes(cookieName)) {
        res.clearCookie(cookieName);
      }
    }
    // if not logged out
    if (req.session.passport) {
      // log out and destroy session
      req.logout();
      utils.logger.debug("Logged out");
      req.session.destroy(function(err) {
        if (err) {
          return next(err);
        }
        utils.logger.silly("Session destroyed by logout request");
        next();
      });
    } else {
      // the end
      next();
    }
  }
}