module.exports = function (utils) {
    let module = {};

    let isAuthenticated = module.isAuthenticated = require("./auth/isAuthenticated")(utils);

    // logout the user, fired as response to request
    let logout = module.logout = require("./auth/logout")(utils);

    return module;
};