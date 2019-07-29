var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
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

let store = {

};

let cocktails = {

};

let accesories = {

};

let carts = {

};

let sessionToUserMap = {

};

let logs = {

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

/*

items.forEach( item =>{
// If item doesn't exist in cart - addItemToCart function
    otherList.push({...item, quantity: 1});
})
*/
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// LOGIN
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
          updateJSON(username, "credentials");
          carts[username] = [];
          updateJSON(username, "cart");
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
        } else {
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

// STORE

app.put('/addItemToStore', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    if (credentials[username].isAdmin)
    {
        const itemToAdd = {...req.body.item};
        store.push(itemToAdd);
        updateJSON(username, "store", itemToAdd, "added");
    }
    else
    {
        res.send(403); // Unauthorized (Forbidden)
    }
});

app.post('/updateStoreItem', (req, res) => {
    var updatedItem = req.body.item;
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    if (credentials[username].isAdmin) {
        store.forEach(item => {
            if (item.itemId == updatedItem.itemId) {
                item.name = updatedItem.name;
                item.price = updatedItem.price;
                item.category = updatedItem.category;
                item.image = updatedItem.image;
            }
        });
        updateJSON(username, "store", updatedItem, "updated");
    }
    else
    {
        res.send(403); // Unauthorized (Forbidden)
    }
});

app.delete('/removeItemFromStore/:itemId', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    var removedItem;
    if (credentials[username].isAdmin) {
        var itemIdToRemove = req.params["itemId"];
        for( var i = 0; i < store.length-1; i++){
            if (store[i].itemId == itemIdToRemove) {
                store.splice(i, 1);
                removedItem = store[i];
            }
        }
        updateJSON(username, "store", removedItem,"removed");
    }
    else
    {
        res.send(403); // Unauthorized (Forbidden)
    }
});

app.get('/store', (req, res) => {
    res.json(store);
    console.log(JSON.stringify(store))
});

// CART

app.put('/addItemToCart', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    var cart = carts[username];
    var item = findItemById(req.body.itemId);
    if (item != "Undefind")
        cart.push({...item, quantity: req.body.quantity});
    else
        res.send(400);
});

app.post('/updateCartItemQuantity', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    var cart = carts[username];
    cart.forEach(item => {
        if (item.itemId == req.body.itemId) {
            if (quantity == 0) {
                cart.remove(item); // TODO: Check if splice is needed here
            } else {
                item.quantity = req.body.quantity;
            }
        }
    });
});

app.delete('/removeItemFromCart/:itemId', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    var cart = carts[username];
    cart.forEach(item => {
        if (item.itemId == req.params["itemId"]) {
            cart.remove(item); // TODO: Check if splice is needed here
        }
    });
});

app.get('/cart', (req, res) => {
    const session = req.cookies.session;
    const username = sessionToUserMap[session];
    var cart = carts[username];
    res.json(cart);
    res.end();
});

// Handling 404 error
app.use((req, res, next) => {
  res.status(404).send("The page you requested cannot be found.")
});

app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));

// LOAD DATA

credentials = JSON.parse(fs.readFileSync('Credentials.json'));
store = JSON.parse(fs.readFileSync('Store.json'));
carts = JSON.parse(fs.readFileSync('Cart.json'));

// HELPERS

function updateJSON(user, type, item, subType)
{
    var jsonFile;
    var jsonData;
    var message;
    switch (type) {
        case "store":
            jsonFile = "Store.json";
            jsonData = JSON.stringify(store);
            message = `${user} has ${subType} an item in the store. Item Name: ${item.name}, Item ID: ${item.itemId}`;
            break;
        case "cart":
            jsonFile = "Cart.json";
            jsonData = JSON.stringify(cart);
            message = `${user} has added a new item to the cart. Item ID: ${item.name}`;
            break;
        case "credentials":
            jsonFile = "Credentials.json";
            jsonData = JSON.stringify(credentials);
            message = `${user} has registered.`;
    }

    fs.writeFile(jsonFile, jsonData,
        function(error) {
            if (error) throw error;
            logActivity(message)
        });
}

function logActivity(message)
{
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    logs.push(`${date} || ${time}:    ${message}`);

    var jsonData = JSON.stringify(logs);
    fs.writeFile("log.json", jsonData,
        function(error) {
            if (error) throw error;
        });
}

function findItemById(itemId)
{
    for (var i = 0; i < store.length - 1; i++)
    {
        if (itemId == store[i].itemId)
        {
            return store[i];
        }
    }

    for (var j = 0; j < cocktails.length - 1; j++)
    {
        if (itemId == cocktails[i].itemId)
        {
            return cocktails[i];
        }
    }

    for (var k = 0; k < accesories.length - 1; k++)
    {
        if (itemId == accesories[i].itemId)
        {
            return accesories[i];
        }
    }

    return "Undefind";
}
