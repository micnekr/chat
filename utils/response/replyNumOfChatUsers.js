module.exports = function(utils) {
  //reply the number of users
  return function(req, res) {
    utils.sql.getChatUsersNumber(req.cookies.chatIdToViewInfo, function(err, rows) {
      if (err) {
        throw new Error(err);
      }

      // converts to a string
      res.send("" + rows[0].num_of_users)
    })
  }
}