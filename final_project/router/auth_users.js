const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  users.map(user => {
    if (user == username) {
      return false
    }
  });
  return true
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username == username);
  if (user?.password == password) {
    return true
  } else {
    return false
  }
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "privateKey", { expiresIn: "1h" });
    req.session.jwt = token;
    return res.status(200).json({message: "Login successful"});
  } else {
      return res.status(401).json({message: "Invalid credentials"});
  }
});

const privateKey = "privateKey"

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.session.jwt
  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, privateKey, { algorithms: ['HS256'] }, function(err, decoded) {
    const { username } = decoded
    if (err || !username) {
      return res.sendStatus(401)
    }
    const isbn = req.params.isbn
    const body = req.body
    if (!books[isbn]) {
      return res.status(400)
    }
    books[isbn].review = {
      ...books[isbn].review,
      [username]: body
    }
    return res.status(201).json({
      message: "success"
    })
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.session.jwt
  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, privateKey, { algorithms: ['HS256'] }, function(err, decoded) {
    const { username } = decoded
    if (err || !username) {
      return res.sendStatus(401)
    }
    const isbn = req.params.isbn
    if (!books[isbn]) {
      return res.status(400)
    }
    delete books[isbn]?.review?.[username]

    return res.status(201).json({
      message: "success"
    })
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
