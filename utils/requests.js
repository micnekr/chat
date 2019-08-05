module.exports = function(utils) {
  let module = {};

  //get chat list response
  module.getChatsList = require('./response/getChatsList')(utils);

  // response to add user to chat request
  module.joinChatRequest = require("./response/joinChatRequest")(utils);

  // response to add chat request
  module.addChatRequest = require("./response/createChat")(utils);

  module.searchForChats = require("./response/searchForChats")(utils);

  module.getChatAndUserData = require("./response/getChatAndUserData")(utils);

  module.isAuthenticated = require("./response/isAuthenticated")(utils);

  return module;
}