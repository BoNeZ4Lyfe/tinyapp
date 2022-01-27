const bcrypt = require('bcryptjs');

const findUserByEmail = (email, database) => {
  for(let userId in database) {
    const user = database[userId];
  
    if(user.email === email) {
      return user.id;
    }
  }
  return undefined;
}

const getUserUrls = (user_id, urlDatabase) => {
const userUrls = {};
for( let url in urlDatabase) {
  if(urlDatabase[url].userId === user_id) {
    userUrls[url] = urlDatabase[url]
  }
}
return userUrls;

};

  const authenticateUser = (email, password, database) => {
const user = findUserByEmail(email,database);

  if(user && bcrypt.compareSync(password, database[user].password)) {
    return user;
  }
  return false;
}

const generateRandomString = () => {

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let str = '';
  for (let i = 0; i < 6; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

  module.exports = {findUserByEmail, authenticateUser, generateRandomString, getUserUrls};
  
