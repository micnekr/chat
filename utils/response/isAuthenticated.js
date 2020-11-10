module.exports = function (utils) {
    return function (req, res, next) {
        if (req.isAuthenticated())
            return res.send(true);
        return res.send(false);
    }
};