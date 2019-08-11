module.exports = function(utils) {

  let module = {
    csrf_bad_token: csrf_bad_token,
    logErrors: logErrors,
    clientErrorHandler: clientErrorHandler,
    errorHandler: errorHandler
  };

  // csrf error handler
  function csrf_bad_token(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    utils.logger.warn("Bad csrf token from " + req.url);

    // if ajax
    if (req.xhr) {
      res.statusMessage = "Bad csrf token";
      return res.status(403).end(res.statusMessage);
    }
    res.redirect("/login");
  }

  // logs express errors
  function logErrors(err, req, res, next) {
    utils.logger.error(err.stack);
    console.log(err);
    next(err)
  }

  // if an AJAX request
  function clientErrorHandler(err, req, res, next) {
    // if an AJAX request
    if (req.xhr) {
      res.statusMessage = "Server error";
      return res.status(500).send("Server error");
    } else {
      next(err)
    }
  }

  function errorHandler(err, req, res, next) {
    res.status(500);
    res.statusMessage = "Internal server error";
    req.default_hbs_url = "500_error";
    utils.hbs_render(req, res);
  }

  return module;
}