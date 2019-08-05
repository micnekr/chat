module.exports = function(utils) {
  module = {};

  const logger = utils.logger;
  const sql = utils.sql;
  const xss = utils.xss;

  module.initChatSocket = function(io) {
    io.use(function(socket, next) {
        // used once the user connects

        // get cookies
        utils.sessionMiddleware(socket.request, socket.request.res, next);
      })
      .use(io_CSRF_connection_protection)
      // when user connects
      .on('connection', function(socket) {

        logger.silly('a user connected');

        // get passport object
        const userInfo = socket.request.session.passport;
        // user room
        let userRoom;

        // disconnect if not logged in
        let user;
        if (userInfo) {
          user = userInfo.user;
        } else {
          socket.disconnect(true);
          logger.debug("User not logged in");
        }



        socket.on('disconnect', function() {
          // log
          logger.silly('user disconnected');
        });


        // when asks to join room
        socket.on("Join room", function(room) {

          // check permission to access chat
          sql.userAndChatDataIfHasPermission(user.id, room, (err, data) => {

            if (err) {
              throw err;
            }

            // if no permission, disconnect
            if (!data) {
              socket.disconnect(true);
              return logger.debug("User not logged in");
            } else {
              // disconnect from all rooms...
              disconnectFromRooms(socket);
              // ... and connect to that room
              socket.join(room);
              userRoom = String(room);
            }
          });
        });

        // when someone writes a message
        socket.on('message out', (msg) => {
          // for getting chat data
          socket.request.query.chatId = msg.chatId;

          forwardMessages(msg, socket, user, userRoom, io);
        });
      });
  }

  // disconnect the socket from all rooms
  function disconnectFromRooms(socket) {
    for (let room in socket.rooms) {
      if (socket.id !== room) socket.leave();
    }
  }

  // adds incoming message to database and constructs message to be sent to other people in chat
  const constructMessageAndAddToDB = module.constructMessageAndAddToDB = require("./io/constructMessageAndAddToDB")(utils, utils.maxChars);



  // separate functions called on events

  //csrf for socket.io
  const io_CSRF_connection_protection = require("./io/CSRF_connection_protection")(utils);

  // broadcast messages to others when one is received
  function forwardMessages(msg, socket, user, userRoom, io) {
    // set sending user
    msg.user = user;

    // construct message object
    constructMessage(msg, socket.request, (err, obj) => {
      if (err) {
        throw err;
      }

      // send message
      if (obj && userRoom) {
        return io.in(userRoom).emit('message in', obj);
      }
    });
  }

  return module;
}