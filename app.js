var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var cookies = require('cookie-session');
var cors = require('cors');
var bodyParser = require('body-parser');
const TokenGenerator = require('uuid-token-generator');


var app = express();

const corsOptions = {
  origin: ['http://localhost:3000'],
  allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers",
  "Access-Control-Allow-Credentials"],
  optionsSuccessStatus: 200,
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));



let credentials = {
  "admin": {password:"admin", isAdmin: true, username:"admin"}
};

let sessionToUserMap = {

};

app.set('port', 8001);

app.use(logger('dev'));
app.use(cookieParser());


/*app.use(express.static('html'));


/*app.use(session({
  key: 'user_sid',
  secret: 'nivmeidar123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 300000 // 5 minutes
  }
}));

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    console.log("Clearing cookies.");
    res.clearCookie('user_sid');
  }
  next();
});

var activeSession = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    console.log("Cookie already exists. Redirecting to Home");
    res.redirect('/home');
  } else {
    next();
  }
};



app.get('/', function(req, res) {
    console.log("Accessed Main Page");
    res.redirect('/login');
});*/

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.route('/login')
    .post((req, res) => {
      var username = req.body.username;
      var password = req.body.password;
      const rememberMe = req.body.rememberMe;
      console.log("Login request initiated. Username:", username);
      if (username && password) {
        var user = credentials[username];
        if (user && password == user.password) {
          console.log("Login Succeeded for user:", username);
          // creating the session token
          const token = new TokenGenerator(256, TokenGenerator.BASE62).generate();
          // setting up expiry date
          const expiration = rememberMe ? 9999999999 : 300000;
          //setting up the cookie
          res.cookie("session", token,{ domain: 'localhost', path: '/', secure: false,expires: new Date(Date.now() + expiration), httpOnly: false });
          //assign the the username to the session
          sessionToUserMap[token] = username;
        } else {
          console.log("Login Failed for user:", username);
          res.status(400);
          res.send('Incorrect Username and/or Password!');

        }
      } else {
        console.log("No username or password found");
        res.status(404);
        res.send('Please enter Username and Password!');

      }
      res.end();
    });

app.route('/registration')
    .post((req, res) => {
      var username = req.body.username;
      var password = req.body.password;
      const rememberMe = req.body.rememberMe;

      var user = credentials[username];

      if (user) {
          res.status(400);
          res.send('Username already exists');
      } else {
          credentials[username]= {password, username, isAdmin: false};
          const token = new TokenGenerator(256, TokenGenerator.BASE62).generate();
          const expiration = rememberMe ? 9999999999 : 300000;
          res.cookie("session", token,
              { domain: 'localhost', path: '/', secure: false,expires: new Date(Date.now() + expiration), httpOnly: false });
          sessionToUserMap[token] = username;
          res.send()
      }
    });

/*
app.post('/auth', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
      var pass = credentials[username];
      if (pass && password == pass) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } else {
        response.send('Incorrect Username and/or Password!');
      }
      response.end();
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});*/

/*
app.get('/home', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + '/home.html');
  } else {
    res.redirect('/login');
  }
});*/

app.get('/user', (req, res) => {
    try{
        const session = req.cookies.session;
        const username = sessionToUserMap[session];
        const user = credentials[username];
        if(user !== undefined){
            res.json({username, isAdmin: user.isAdmin});
            res.end();
        }else{
            res.status(404);
            res.send("Could not find user");
        }
    }
    catch (e) {
        res.status(404);
        res.send("Could not find user");
    }
});

app.post('/logout', (req, res) => {
    try{
        const session = req.cookies.session;
        const username = sessionToUserMap[session];

        if(username !== undefined){
            delete sessionToUserMap[session];
            res.clearCookie('session');
            res.end();
        }else{
            res.status(404);
            res.clearCookie('session');
            res.send("Could not find user");
        }

    }
    catch (e) {
        res.status(404);
        res.send(e.toString());
    }
});



// Handling 404 error
app.use((req, res, next) => {
  res.status(404).send("The page you requested cannot be found.")
});

app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));

