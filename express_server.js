//REQUIREMENTS
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = 8080; // default port 8080

const generateRandomString = () => {

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let str = '';
  for (let i = 0; i < 6; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

const findUserbyEmail = (email, database) => {
for(let userId in database) {
  const user = database[userId];

  if(user.email === email) {
    return user;
  }
}
return false;
}

const authenticateUser = (email, password, database) => {
const user = findUserbyEmail(email,database);
if(user && user.password === password) {
 
  return user;
}
return false;
}

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
  password: 123
},
"user2RandomID": {
  id: "user2RandomID", 
  email: "user2@example.com", 
  password: 123
}
}


//SERVER SETTINGS AND MIDDLEWARES
app.use(cookieParser());
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
  const userId = req.cookies['user_id']
  const templateVars = { urls: urlDatabase, user: userDatabase[userId]};
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id']
  const templateVars = {user: userDatabase[userId]};
  
  if(userId) {
    res.render("urls_new", templateVars);
  }
  res.redirect('/login')
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id']
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: userDatabase[userId] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const {longURL} = urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(longURL);
});

//Views auth routes
app.get("/register", (req, res) => {
  //redirect to url page if cookie doesnt exist
  const templateVars = {user: null};
  res.render('register', templateVars);
});

app.get('/login', (req,res) => {
   //redirect to url page if cookie does exist
  const templateVars = {user: null};

  res.render('login', templateVars);
});

//CRUD URLs Routes
//create Url
app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
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

//update URL
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.cookies.user_id;
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

  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = {
    longURL,
    userId: user.id,
  };

  res.redirect(`/urls/${shortURL}`); 
});

//Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.cookies.user_id;
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


//auth routes
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password, userDatabase);

  if(user) {

    res.cookie('user_id', user.id)
    return res.redirect(`/urls`);
  }
  res.status(403).send('Wrong Credentials!');
  
});

app.post('/logout', (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserbyEmail(email,userDatabase);

  if(user) {
    return res.status(403).send('User already exists!');
  }


const userId = generateRandomString();

  const newUser = { 
    id: userId, 
    email, 
    password,
  };

  userDatabase[userId] = newUser;
  res.cookie('user_id', userId);
  res.redirect('/urls');

});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
