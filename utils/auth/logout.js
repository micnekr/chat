module.exports = function (utils) {
    return function (req, res, next) {

        // do not logout remember me but if not logout completely
        if (req.cookies["rememberMe"] === "true" && !req.logoutAnyway) {
            return next();
        }


        // clear cookies
        for (let cookieName of Object.keys(req.cookies)) {
            // check if the cookie shoulf be deleted
            if (!utils.cookiesNotToDeleteOnLogout.includes(cookieName)) {
                res.clearCookie(cookieName);
            }
        }

        // if not logged out and passport session exists
        if (req.session.passport) {
            // log out and destroy session
            req.logout();
            utils.logger.debug("Logged out");

            // deletes the record in passport
            req.session.destroy(function (err) {
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
};