module.exports = function(utils, sql) {

  let addUserToChat = module.addUserToChat = function(userId, chatId, client, done, finish) {

    // if already opened client session
    if (client && done) {
      return __addUserToChat(userId, chatId, client, done, finish);
    }

    // create a new session
    utils.sql.pool.connect(function(err, client, done) {
      if (err) {
        done();
        return finish(err)
      }

      return __addUserToChat(userId, chatId, client, done, function(err, wasAdded) {
        // close the session
        done()
        return finish(err, wasAdded);
      });
    })
  }

  function __addUserToChat(userId, chatId, client, done, finish) {
    // a utility to automatically log and disconnect on error
    function disconnectOnError(err) {
      if (err) {
        // disconnect the client
        done();
        return finish(err);
      }
    }

    client.query("BEGIN", [], function(err) {
      disconnectOnError(err);

      // add the user to the chat
      client.query("INSERT INTO chat_users (chat_id, user_id) VALUES ( $1, $2 );", [chatId, userId], function(err) {
        disconnectOnError(err);

        // increase chat users counter
        client.query("UPDATE chats SET num_of_users = num_of_users + 1 WHERE id = $1;", [chatId], function(err) {
          disconnectOnError(err);

          // commit
          client.query("COMMIT", [], function(err) {
            disconnectOnError(err);

            // do not forget to close the session
            return finish(null, true)
          })
        })
      })
    })
  }

  // adds user to chat if he wasn't there already
  let addUserToChatIfNotAlready = module.addUserToChatIfNotAlready = function(userId, chatId, client, done, finish) {
    sql.isUserInChat(userId, chatId, function(err, isInChat) {
      if (err) {
        return finish(err, undefined);
      } else if (isInChat) {
        return finish(null, false);
      } else {
        addUserToChat(userId, chatId, client, done, finish);
      }
    })
  }

  return module;
}