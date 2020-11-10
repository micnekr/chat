module.exports = function (utils) {
    return function (req, res, next) {
        // let through if authenticated
        if (req.isAuthenticated())
            return next();
        // if ajax, set send error code
        utils.logger.warn("Not authenticated. Tried to access: " + req.url);
        if (req.method == "POST") {
            return res.sendStatus(401).end();
        }
        // otherwise, return login page code
        return res.redirect("/login");
    }
};
