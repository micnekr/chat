module.exports = function(utils) {
  return function(req, res, next) {
    let userId = req.session.passport.user.id;
    let chatId = req.body.chatId;

    // check if chat can be joined by request
    let query = `SELECT admission_type_id
    FROM chats
    WHERE id=$1`;
    utils.sql.get(query, [chatId], function(err, data) {
      if (err) return next(err);

      // if incorrect chat admission type, return error
      if (data.rows[0].admission_type_id !== 1) {
        res.statusMessage = "You can not send admission requests to this chat";
        return res.status(400).send(res.statusMessage);
      }

      // if the statement is already there
      let query = `SELECT chat_id FROM chat_admission_requests WHERE chat_id=$1 AND user_id=$2`
      utils.sql.get(query, [chatId, userId], function(err, data) {
        if (err) return next(err);

        // if the same request was aalready sent
        if (data.rows[0]) {
          res.statusMessage = "You have already sent a request to this chat.";
          utils.logger.silly(res.statusMessage);
          return res.status(400).send(res.statusMessage);
        }

        // else, add a request

        // create a new session
        utils.sql.pool.connect(function(err, client, done) {
          disconnectOnError(err);

          // a utility to automatically log and disconnect on error
          function disconnectOnError(err) {
            if (err) {
              // disconnect the client
              done();
              return next(err);
            }
          }

          //begin transaction
          client.query("BEGIN;", [], function(err) {
            disconnectOnError(err);

            // add request to db
            let query = `INSERT INTO chat_admission_requests (chat_id, user_id)
          VALUES ( $1, $2 );`;
            client.query(query, [chatId, userId], function(err, done) {
              disconnectOnError(err);

              // increase number of requests
              let query = `UPDATE chats
            SET admission_requests_count = admission_requests_count + 1
            WHERE id = $1;`

              client.query(query, [chatId], function(err) {
                disconnectOnError(err);

                // end transaction
                client.query("COMMIT", [], function(err) {
                  disconnectOnError(err)
                  done();
                  return res.status(200).end();
                })
              })
            })
          })
        })
      })
    })
  }
}