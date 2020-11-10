module.exports = function (utils) {
    let module = {};

    const fs = require('fs');
    const bcrypt = require('bcrypt');
    const NodeCache = require("node-cache");
    const crypto = require("crypto");
    const mailjet = require('node-mailjet').connect('2cf55dcfadfe93a159a0b7f0ac393b30', 'e46cfdad0ce96e3a7dd8191cd4e30300');


    const verificationCodes = new NodeCache({
        stdTTL: utils.timeForPasswordReset,
        checkperiod: utils.timeForPasswordReset
    });

    // setup sendjet
    const sender = mailjet.post("send", {
        'version': 'v3.1'
    });
    // TODO: change this file
    const verificationHTML = fs.readFileSync("./views/forgotPasswordEmail.html", "utf8");


    module.sendEmail = function (req, res, next) {
        let username = req.body.username;
        if (!username) {
            // ask for a username
            res.statusMessage = "No username specified for password reset";
            return res.status(400).send(res.statusMessage);
        }

        // generate the key
        crypto.randomBytes(48, function (err, buffer) {

            if (err) {
                return next(err);
            }

            var token = buffer.toString('base64');
            console.log(token);

            // check if the user is verified
            utils.sql.pool.query("SELECT email FROM users WHERE verified=true AND LOWER(username)=$1", [username.toLowerCase()], function (err, data) {
                if (err) {
                    return done(err);
                }

                // if someone exists
                if (data.rowCount === 1) {

                    bcrypt.hash(token, utils.saltRounds, function (err, hash) {

                        if (err) {
                            return done(err);
                        }

                        let obj = {
                            token: hash,
                            time: Date.now()
                        };

                        // set the token
                        verificationCodes.set(username, obj, function (err, success) {

                            if (err) {
                                return next(err);
                            }

                            let request = sender.request({
                                "Messages": [{
                                    "From": {
                                        "Email": "no-reply@ibdc.ru",
                                        "Name": "Password reset"
                                    },
                                    "To": [{
                                        "Email": data.rows[0].email,
                                    }],
                                    "Subject": "Password reset", // TODO: change link
                                    "TextPart": 'Please, go to "' + utils.hostBase + '/email_confirmation_link?token=' + token + '" (without the quotes)',
                                    "HTMLPart": verificationHTML, // TODO: change the email
                                    "TemplateLanguage": true,
                                    "Variables": {
                                        token: token,
                                        site: utils.hostBase
                                    }
                                }]
                            });
                            request.then((result) => {
                                utils.logger.debug("Password reset email is sent if the account exists");
                                return res.end();
                            })
                                .catch((err) => {
                                    return next(err);
                                })
                        });
                    })

                    // otherwise
                } else {
                    res.statusMessage = "This account's email is not verified or this account does not exist";
                    return res.status(400).send(res.statusMessage);
                }
            })
        });
    };

    module.verifyEmail = function (req, res, next) {
        let token = req.body.token;
        let password = req.body.password;
        if (!token) {
            res.statusMessage = "No token supplied";
            return res.status(400).send(res.statusMessage);
        }

        if (!password) {
            res.statusMessage = "Please, type in your new password";
            return res.status(400).send(res.statusMessage);
        }


        verificationCodes.get(token, function (err, value) {
            if (err) {
                return next(err);
            }

            if (value) {

                // if expired
                //timeForEmailVerification is in seconds
                if (value.time + utils.timeForPasswordReset * 1000 < Date.now()) {
                    // add this option. add options object if needed
                    if (!req.hbs_options) req.hbs_options = {};
                    req.isCorrectToken = req.hbs_options.isCorrectToken = false;
                    return next();
                }

                // the password is now to be reset
                verificationCodes.del(token, function (err, count) {
                    if (err) {
                        return next(err);
                    }

                    // add this option. add options object if needed
                    if (!req.hbs_options) req.hbs_options = {};
                    req.isCorrectToken = req.hbs_options.isCorrectToken = true;

                    // TODO: continue from here
                    // TODO: notify if the token is wrong before password

                    // utils.sql.pool.query("UPDATE users SET verified=true WHERE LOWER(email)=$1", [value.email.toLowerCase()], function (err, data) {
                    //     if (err) {
                    //         return done(err);
                    //     }
                    //
                    //     // if someone exists
                    //     if (data.rowCount == "1") {
                    //         return next();
                    //
                    //         // otherwise
                    //     } else {
                    //         res.statusMessage = "This email is not used by any accounts";
                    //         return res.status(400).send(res.statusMessage);
                    //     }
                    // })
                })


            } else {
                // wrong token

                // add this option. add options object if needed
                if (!req.hbs_options) req.hbs_options = {};
                req.isCorrectToken = req.hbs_options.isCorrectToken = false;
                return next();
            }
        });
    };

    return module;
};