module.exports = function (utils) {
    const internalErrorMessage = "Internal error on server. Please, try again.";
    const nameExistsMessage = "A chat with the same name already exists. Please, choose a different name.";

    return function (req, res, next) {
        // get data from request
        let settings = req.body;
        let userId = req.session.passport.user.id;

        // get chat admission type id
        settings.chatAdmissionTypeId = Number(settings.chatAdmissionTypeId);

        // validate data
        if (utils.maxChatNameLength < settings.chatName.length) {
            res.statusMessage = `The maximum length of a chat name is ${utils.maxChatNameLength} characters. You typed in ${settings.chatName.length} characters.`;
            return res.status(400).end();
        }

        if (settings.chatAdmissionTypeId !== 0 && settings.chatAdmissionTypeId !== 1) {
            res.statusMessage = 'Please, select a chat admission type.';
            return res.status(400).end();
        }

        // create a new session
        utils.sql.pool.connect(function (err, client, done) {
            if (err) {
                done();
                return next(err);
            }

            client.query("BEGIN", [], (err) => {
                // add a chat
                utils.sql.addChatIfNotExists(settings.chatName, settings.chatAdmissionTypeId, userId, client, done, (err, uniqueName, chatId) => {
                    if (err) {
                        res.statusMessage = internalErrorMessage;
                        return next(err);
                    }

                    // if the chat already existed, return
                    if (!uniqueName) {
                        res.statusMessage = nameExistsMessage;
                        return res.status(400).end();
                    }

                    //otherwise, add admin to the new chat
                    utils.sql.addUserToChatIfNotAlready(userId, chatId, client, done, function (err) {
                        if (err) {
                            res.statusMessage = internalErrorMessage;
                            return next(err);
                        }
                        client.query("COMMIT", [], (err) => {
                            if (err) {
                                done();
                                return next(err);
                            }
                            res.end();
                        })
                    })
                })
            })
        })
    }
};