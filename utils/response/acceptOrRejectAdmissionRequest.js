module.exports = function(utils) {
  return function(req, res, next) {
    let adminId = req.session.passport.user.id;
    let chatId = req.body.chatId;
    let userId = req.body.userId;
    let addToChat = req.body.isAddToChat;

    // check if the user is the admin of this chat
    let query = `SELECT name
                 FROM chats
                 WHERE admin_id=$1 AND id=$2`
    utils.sql.pool.query(query, [adminId, chatId], function(err, data) {
      if (err) return next(err);

      // if no permission
      if (!data.rows[0]) {
        res.statusMessage = "You are not this chat's admin";
        utils.logger.silly(res.statusMessage);
        return res.status(403).send(res.statusMessage);
      }

      // reserve a client
      // do not forget to call done even in case of error
      utils.sql.pool.connect(function(err, client, done) {
        if (err) return next(err)

        // a utility to automatically log and disconnect on error
        function disconnectOnError(err) {
          if (err) {
            // disconnect the client
            done();
            return next(err);
          }
        }

        disconnectOnError(err);

        // begin transaction
        client.query("BEGIN", [], function(err) {
          disconnectOnError(err);

          // delete the entry
          // nothing will happen if no entries match
          let query = `DELETE FROM chat_admission_requests
                     WHERE chat_id=$1 AND user_id=$2`;

          client.query(query, [chatId, userId], function(err, data) {
            disconnectOnError(err);

            // decrease counter of admission requests for that chats
            let query = `UPDATE chats
                       SET admission_requests_count = admission_requests_count - 1
                       WHERE id = $1;`
            client.query(query, [chatId], function(err) {
              disconnectOnError(err);

              // commit if admin wants to reject
              if (addToChat !== "true") {
                commit(disconnectOnError, client, res, done)
              } else {
                // add user to chat
                utils.sql.addUserToChatIfNotAlready(userId, chatId, client, done, function(err) {
                  if (err) next(err);
                  // finish transaction

                  commit(disconnectOnError, client, res, done)
                })
              }
            })
          })
        })
      })
    })
  }
};

function commit(disconnectOnError, client, res, done) {
  client.query("COMMIT", [], function(err) {
    disconnectOnError(err);

    // do not forget to close the session
    done();

    res.end();
  })
}