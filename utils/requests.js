module.exports = function (utils) {
    let module = {};

    //get chat list response
    module.getChatsList = require('./response/getChatsList')(utils);

    // response to add user to chat request
    module.joinChat = require("./response/joinChat")(utils);

    // response to add chat request
    module.addChatRequest = require("./response/createChat")(utils);

    module.searchForChats = require("./response/searchForChats")(utils);

    module.getChatAndUserData = require("./response/getChatAndUserData")(utils);

    module.isAuthenticated = require("./response/isAuthenticated")(utils);

    module.requestAdmission = require('./response/requestAdmission')(utils);

    module.getNotificationsNum = require("./response/getNotificationsNum")(utils);

    module.getAdminChatsListAndNotifications = require("./response/getAdminChatsListAndNotifications")(utils);

    module.getListOfAdmissionsRequests = require("./response/getListOfAdmissionsRequests")(utils);

    module.acceptOrRejectAdmissionRequest = require("./response/acceptOrRejectAdmissionRequest")(utils);

    module.changeEmail = require("./response/changeEmail")(utils);

    return module;
};