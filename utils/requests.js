module.exports = function(utils) {
  let module = {};

  //get chat list response
  module.getChatsList = require('./response/getChatsList')(utils);

  // response to add user to chat request
  module.joinChatRequest = require("./response/joinChatRequest")(utils);

  // response to add chat request
  module.addChatRequest = require("./response/createChat")(utils);

  // replies the number of users in a chat
  module.replyNumOfChatUsers = require("./response/replyNumOfChatUsers")(utils);

  module.searchForChats = require("./response/searchForChats")(utils);

  module.getChatAndUserData = require("./response/getChatAndUserData")(utils);

  module.isAuthenticated = require("./response/isAuthenticated")(utils);

  module.isUserInChat = require("./response/isUserInChat")(utils);

  return module;
}