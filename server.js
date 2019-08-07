/*jshint esversion: 6 */ /* jshint unused: true */

"use strict";

const port = process.env.PORT || 8124;
const saltRounds = 12;
const maxAge = null; //session ends when the browser is closed
const maxChars = 300;
const joinPublicChat = true;
const publicChatId = 1;
const logDir = './log';
const loggerLevel = "silly";
const jquerySource = "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js";
// const jquerySource = "../src/jquery.js";
const cookiesNotToDeleteOnLogout = ["rememberMe"];
const defaultMessagesNum = 100;
const maxChatNameLength = 40;
const maxUsernameSymbols = 15;
const maxEmailSymbols = 254;
const usernameRegex = /^[a-zA-Z0-9\s_]*$/;

const isBehindProxy = true;
const useSecureCookies = false;

// setImmediate

// port for postgresql is 5432

// DROP DATABASE  data;
// CREATE DATABASE data WITH TEMPLATE postgres OWNER serverquerymanager; -- to create a copy

// git add -all
// git status
// git commit -m "message"
//git checkout -b branchName - create a branch
// git branch - check your branch
// git checkout master - go to master branch
// git push -u origin master - push master branch to github
// git pull origin master - get the changes back

// pm2 start ecosystem.config.js
// pm2 stop ecosystem.config.js








// DO NOT FORGET with new pages
// TODO: do not allow users with javascript turned off
// TODO: do not forget to delete user from cache after deleting from chat
// TODO: logout when not using page for long enough
// TODO: csrf
// TODO: unclosed tags in chat names
// TODO: no capitals, use _
// TODO: escape url search queries before filtering xss
// TODO: mind xss

// what I can't do now
// TODO: email the confirmation link
// TODO: check email address
// TODO: captcha on signup
// TODO: prevent user population on signip and password reset - see previous point

// maybe later
// TODO: login rememberMe redirect check on server
// TODO: cluster and solve memory problems
// TODO: tests
// TODO: end to end encryption
// TODO: tags for messages
// TODO: photos, videos
// TODO: submit a bug page
// TODO: fix protocol
// TODO: fix signup, sql/create chat to use transactions
// TODO: ratelimit messages
// TODO: test if it is faster to send all messages or n last messages
// TODO: add a button "show more messages"
// TODO: change data format for getChatAndUserData
// TODO: add messages about joining and leaving the chat
// TODO: cache
// TODO: user profiles
// TODO: user icons
// TODO: change all boolean queries to be sql and merge into transaction with other statements if possible
// TODO: change password
// TODO: look at security and node practices
// TODO: optimise psql get
// TODO: user profiles in the menu
// TODO: use hbs to choose between buttons in chatinfo and optimise further
// TODO: check time of request processing
// TODO: change menu to post and check for errors
// TODO: change url function to remove "/"

// !!!!!!!!!!!!!!!IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!
// TODO: move https to nginx

// TODO: optimise pages with hbs




// TODO: ngnix
// TODO: redirect http to https

// for release:
// TODO: clear logs
// TODO: clear db
// TODO: make a valid certificate
// TODO: clear node_modules
// TODO: set constants



const express = require('express');
let app = express();

const path = require('path');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const LocalStrategy = require('passport-local').Strategy;
const Pool = require('pg').Pool;
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const fs = require('fs');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const csrf = require('./modifiedPackages/node_modules/csurf');

// setup sql
const pool = new Pool({
  user: 'serverquerymanager',
  host: 'localhost',
  database: 'data',
  password: fs.readFileSync("data/keys/dbPassword.txt").toString().replace(/[\r\n]/g, ""),
  port: 5432,
})

// user modules
let utils = {
  passport: passport,
  bcrypt: bcrypt,
  pool: pool,
  maxChars: maxChars,
  cookiesNotToDeleteOnLogout: cookiesNotToDeleteOnLogout,
  defaultMessagesNum: defaultMessagesNum,
  usernameRegex: usernameRegex,
  maxChatNameLength: maxChatNameLength,
  maxUsernameSymbols: maxUsernameSymbols,
  maxEmailSymbols: maxEmailSymbols,
  hbs_render: hbs_render
};


const logger = utils.logger = require('./utils/winston-setup')(fs, logDir, path, loggerLevel);
const xss = utils.xss = require('./utils/xss').xss;
const sql = utils.sql = require('./utils/sql')(utils);
const auth = utils.auth = require('./utils/auth')(utils);
const requests = require('./utils/requests')(utils);
const ioConfigFile = utils.ioConfigFile = require('./utils/io');
const login = utils.login = require('./utils/login')(utils, maxAge, publicChatId);
const signup = utils.signup = require('./utils/signup')(utils, saltRounds, publicChatId, joinPublicChat);
const chatSearchSuggestions = utils.chatSearchSuggestions = require('./utils/chatSearchSuggestions')(utils);
const messageEncrypt = utils.messageEncrypt = require('./utils/messageEncrypt')();
const express_error_handlers = utils.express_error_handlers = require('./utils/express_error_handlers')(utils);
const expressCustomMiddleware = require('./utils/expressCustomMiddleware')(utils);

//setup server

// set http/https options
let configureServer
if (isBehindProxy) {
  configureServer = require('./utils/listenHTTP');
} else {
  configureServer = require('./utils/listenHTTPS');
}
let server = configureServer(utils, port, app);
module.exports = server;



//setup crypto

// get secret

//get secret
let hash = crypto.createHash('sha512');
const secret = hash.update(crypto.randomBytes(512)).digest('base64');
logger.info("Generated secret.");

// session middleware
const sessionMiddleware = utils.sessionMiddleware = session({
  store: new pgSession({
    pool: pool
  }),
  name: 'sessionId',
  httpOnly: true,
  secret: secret,
  resave: false,
  saveUninitialized: false,
  proxy: isBehindProxy,
  cookie: {
    secure: useSecureCookies,
    maxAge: maxAge
  }
});

setupExpress();

// protect from csrf
let csrfProtection = utils.csrfProtection = csrf({
  proxy: isBehindProxy,
  cookie: {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: true,
    maxAge: maxAge,
  }
})

// login ratelimit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many attempts to log in. Please, try again in 15 minutes.",
  skipSuccessfulRequests: true
});

// unsuccessful signup ratelimit
const signupFailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts to sign up. Please, try again in 15 minutes.",
});

// unsuccessful signup ratelimit
const signupSuccessLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 2,
  skipFailedRequests: true,
  message: "You are creating too many accounts. Please, try again in an hour",
});

// sql ratelimit
const createChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2,
  message: "Too many attempts to create a chat. Please, try again in 15 minutes.",
  skipFailedRequests: true,
  keyGenerator: passportKeyGeneratorForRateLimiter
});

// sql ratelimit
const searchForChatsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,
  message: "Too many attempts to search for a chat. Please, try again in 5 minutes.",
  keyGenerator: passportKeyGeneratorForRateLimiter
});

//setup socket.io
const io = require('socket.io')(server);
const ioConfig = ioConfigFile(utils);

ioConfig.initChatSocket(io);

//setup passport
passport.use(new LocalStrategy(login.checkPasswordForPassport));
passport.serializeUser(function(user, done) {
  done(null, {
    username: user.username,
    email: user.email,
    id: user.id
  });
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// setup hbs
hbs.registerPartial('menu', fs.readFileSync(__dirname + '/views/partials/menu.hbs', 'utf8'));
hbs.registerPartial('backButton', fs.readFileSync(__dirname + '/views/partials/backButton.hbs', 'utf8'));

hbs.registerPartial('private', fs.readFileSync(__dirname + '/views/partials/private.hbs', 'utf8'));
hbs.registerPartial('public', fs.readFileSync(__dirname + '/views/partials/public.hbs', 'utf8'));

hbs.registerPartial('enable_js', fs.readFileSync(__dirname + '/views/partials/enableJsMessage.hbs', 'utf8'));


// open pages

// redirect / to chatsList
app.get("/", function(req, res) {
  res.redirect("/chats_list")
})

// error 500
app.get("/500_error", hbs_render);

// log user out on login page
app.get("/login", auth.logout, hbs_render);

app.post("/login", loginLimiter, login.loginRequest);

app.get("/isAuthenticated", requests.isAuthenticated)

//logout page
app.get("/logout", setLogoutAnyway, auth.logout, hbs_render);

// signup request
app.post("/signUp", signupFailLimiter, signupSuccessLimiter, signup.signUp);

app.get("/sign_up", hbs_render);

app.get("/sign_up_success", hbs_render);

//protected pages
app.use(auth.isAuthenticated);

// sends chat data
app.get("/loadChatAndMessagingInfo", requests.getChatAndUserData);

app.get("/chat", csrfProtection, hbs_render);

app.get("/chats_list", hbs_render);

// get list of user chats
app.post("/allChats", requests.getChatsList);

// creating a chat
app.get("/chat_created", hbs_render);

app.get("/create_chat", csrfProtection, hbs_render);

app.post("/createChat", createChatLimiter, csrfProtection, requests.addChatRequest);

// joining the chat
app.get("/chat_information", expressCustomMiddleware.isUserInChat, expressCustomMiddleware.getNumberOfChatUsers, csrfProtection, hbs_render);

app.post("/joinChat", csrfProtection, requests.joinChatRequest)

// searching for a chat
app.get("/chatSearch", searchForChatsLimiter, requests.searchForChats);

app.get("/search_for_chats", hbs_render);

// if request not found, show 404 error page
app.all("*", function(req, res, next) {
  // if ajax
  if (req.xhr || req.method !== "GET") {
    res.statusMessage = "Not found";
    return res.status(404).end();
  } else {
    req.default_hbs_url = "404_error";
    return hbs_render(req, res);
  }
})

app.use(express_error_handlers.csrf_bad_token);
app.use(express_error_handlers.logErrors);
app.use(express_error_handlers.clientErrorHandler);
app.use(express_error_handlers.errorHandler);


server.listen(port, () => {
  utils.logger.info("Listening at port " + port);
});


// express
function setupExpress() {
  app.set('views', path.join(__dirname, 'views'));
  app.engine('hbs', hbs.__express);
  app.set('view engine', 'hbs');
  if (isBehindProxy) {
    app.set("trust proxy", "loopback");
  }
  app.use(express.static(path.join(__dirname, "views")));
  app.use(favicon(path.join(__dirname, 'views', 'images', 'favicon.ico')));
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());
  app.use(helmet());
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
}





// utilities

function hbs_render(req, res) {
  let url = req.default_hbs_url || req.path.substr(1); // delete first /

  let options = req.hbs_options || {};

  if (!url.endsWith("/")) {
    url += "/";
  }

  // only add csrf token if it exists
  let csrfToken = req.csrfToken ? req.csrfToken() : undefined;
  res.render(url.toLowerCase() + "index", {
    layout: false,
    csrfToken: csrfToken,
    jquerySource: jquerySource,
    isUserInChat: options.isUserInChat,
    chatUsersNum: options.chatUsersNum
  });
}

function setLogoutAnyway(req, res, next) {
  req.logoutAnyway = true;
  return next();
}

function passportKeyGeneratorForRateLimiter(req, res) {
  return req.session.passport.user.id
}

function create_error_500() {
  throw new Error("test error for 500_error page");
}

function create_error_402(req, res) {
  res.statusMessage = "test error for 402 custom message";
  res.status(402).end();
}