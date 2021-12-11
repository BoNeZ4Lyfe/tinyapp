const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");


function generateRandomString() {
   
     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < 6; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase,username: req.cookies["username"]};
  res.render('register', templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortUrl = generateRandomString();
  let longURL = req.body.longURL;
  if(longURL.substr(0,4) !== 'http') {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortUrl] = longURL;
  res.redirect(`/urls/${shortUrl}`);         
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(req.body);
  const shortURL = req.params.shortURL;
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});

app.post('/urls/:shortURL', (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);

});
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);

});
app.post('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.post('/register', (req,res) => {
  //collecting user information
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  for(const userId in userDatabase) {
    const user = userDatabase[userId];

    if(user.email === email) {
      return res.send('User already exists!');
    }
  }

  const newUser = { 
      id: userId, 
      email: email, 
      password: password,
    };

    userDatabase[userId] = newUser;
    res.cookie('user_id', userId);
    res.redirect('/urls');

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
