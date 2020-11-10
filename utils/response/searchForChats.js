module.exports = function (utils) {
    // searching for chats
    return function (req, res, next) {
        let userInput = req.query.term;

        utils.chatSearchSuggestions.suggestChats(userInput, utils.chatSearchSuggestions.wordSplit, function (err, rows) {
            if (err) {
                return next(err);
            }
            return res.send(rows);
        })
    }
};