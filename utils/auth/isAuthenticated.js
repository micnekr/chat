module.exports = function(utils) {
  return function(req, res, next) {
    if (req.isAuthenticated())
      return next();
    utils.logger.warn("Not authenticated");
    if (req.method == "POST") {
      return res.sendStatus(401);
    }
    return res.redirect("/login");
  }
}