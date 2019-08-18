module.exports = function(utils) {

  let module = {};

  module.pool = utils.pool;



  //returns username, chat name and their ids if user has permission. otherwise, returns false.
  const userAndChatDataIfHasPermission = module.userAndChatDataIfHasPermission = require('./sql/userAndChatDataIfHasPermission')(utils, module);




  // simple queries of data
  const simpleQueries = require('./sql/simpleQueries')(utils, module);

  //gets all data about user in users table.
  let loadUserData = module.loadUserData = simpleQueries.loadUserData;

  // gets data about messages of chat
  let getChatMessages = module.getChatMessages = simpleQueries.getChatMessages;



  // true or false queries
  const booleanQueries = require('./sql/booleanQueries')(utils, module);

  // if the user is in the chat
  let isUserInChat = module.isUserInChat = booleanQueries.isUserInChat;




  const addUserToChatModule = require('./sql/addUserToChat')(utils, module);

  // adds user to chat anyway
  let addUserToChat = module.addUserToChat = addUserToChatModule.addUserToChat;

  // add user to chat if he wasn't there already
  let addUserToChatIfNotAlready = module.addUserToChatIfNotAlready = addUserToChatModule.addUserToChatIfNotAlready;

  const getChatUsersNumber = module.getChatUsersNumber = require('./sql/getChatUsersNumber')(utils);

  const selectNMessages = module.selectNMessages = require("./sql/selectNMessages")(utils);

  // chat creation
  const createChat = module.createChat = require('./sql/createChat')(utils);

  const addChatIfNotExists = module.addChatIfNotExists = createChat.addChatIfNotExists;



  const get = module.get = require('./sql/get')(utils);

  return module;
}