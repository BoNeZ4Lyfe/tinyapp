//REQUIREMENTS
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {findUserByEmail, authenticateUser, generateRandomString} = require('./helpers');

const PORT = 8080; // default port 8080



const urlDatabase = {
"b2xVn2": {
  longURL: "http://www.lighthouselabs.ca",
  userId: 'user1',
},

"9sm5xK": {
  longURL: "http://www.google.com",
  userId: 'user2',
},
};

const userDatabase = { 
"userRandomID": {
  id: "userRandomID", 
  email: "user@example.com", 
  password: 123,
},
"user2RandomID": {
  id: "user2RandomID", 
  email: "user2@example.com", 
  password: 123,
},
};


//SERVER SETTINGS AND MIDDLEWARES
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1' , 'key2'],
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//ROUTES

//Home route
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Database json routes
app.get("/users.json", (req, res) => {
  res.json(userDatabase);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Views URLs routes
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: userDatabase[userId]};
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: userDatabase[userId]};
  
  if(userId) {
    return res.render("urls_new", templateVars);
  }
  res.redirect('/login')
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: userDatabase[userId] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const {longURL} = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Views auth routes
app.get("/register", (req, res) => {
  const templateVars = {user: null};
  res.render('register', templateVars);
});

app.get('/login', (req,res) => {
  const templateVars = {user: null};

  res.render('login', templateVars);
});

//CRUD URLs Routes
//Create URL
app.post("/urls", (req, res) => {

  const userId = req.session.user_id;
  if(!userId) {
    return res.status(400).send("Please login");
  }

  const user = userDatabase[userId];
  if(!user) {
    return res.status(400).send('User is not valid');
  }

  let longURL = req.body.longURL;
  if(!longURL) {
    return res.status(400).send('Please pass a longURL');
  }

  const longURLIncludesHttp = longURL.substr(0,4) === 'http';
  if(!longURLIncludesHttp) {
    longURL = 'http://' + longURL;
  }

  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL,
    userId: user.id,
  };

  res.redirect(`/urls/${shortURL}`);      
});

//Update URL
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  if(!userId) {
    res.status(400).send("Please login");
  }

  const user = userDatabase[userId];
  if(!user) {
    return res.status(400).send('User is not valid');
  }

  let longURL = req.body.longURL;
  if(!longURL) {
    return res.status(400).send('Please pass a longURL');
  }

  const longURLIncludesHttp = longURL.substr(0,4) === 'http';
  if(!longURLIncludesHttp) {
    longURL = 'http://' + longURL;
  }

  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = {
    longURL,
    userId: user.id,
  };

  res.redirect(`/urls/${shortURL}`); 
});

//Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  if(!userId) {
    return res.status(400).send("Please login");
  }

  const user = userDatabase[userId];
  if(!user) {
    return res.status(400).send('User is not valid');
  }

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];

  res.redirect("/urls");

});


//Auth routes
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, userDatabase);
  
  if(!user) {
    return res.status(403).send('Wrong Credentials');
  }

  req.session.user_id = userDatabase[user].id;
    return res.redirect(`/urls`);
});

app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/login');
})

app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email,userDatabase);

  if(user) {
    return res.status(403).send('User already exists!');
  }

  bcrypt.genSalt(10, (err,salt) => {
    bcrypt.hash(password, salt, (err, hash) => {

const userId = generateRandomString();

  const newUser = { 
    id: userId, 
    email, 
    password: hash,
  };

  userDatabase[userId] = newUser;
  req.session.user_id = userId
  res.redirect('/urls');

  })
});


});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});