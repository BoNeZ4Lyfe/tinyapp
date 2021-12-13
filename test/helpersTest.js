const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";

    assert.equal(user,expectedUserID);
  });
});

describe('findUserByEmail', function() {
  it('should return undefined if an unvalid email is entered', function() {
    const user = findUserByEmail("notauser@example.com", testUsers)
    
    assert.equal(user, undefined);
  });
});

describe('findUserByEmail', function() {
  it('should return undefined if an email is not entered', function() {
    const user = findUserByEmail("", testUsers)
    
    assert.equal(user,undefined);
  });
});