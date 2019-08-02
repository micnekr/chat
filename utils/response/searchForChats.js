module.exports = function(utils) {
  // searching for chats
  return function(req, res) {
    let userInput = req.query.term;
    utils.chatSearchSuggestions.suggestChats(userInput, utils.chatSearchSuggestions.wordSplit, function(err, rows) {
      if (err) {
        throw new Error(err);
      }
      return res.send(rows);
    })
  }
};