const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const books = require("./booksdb")

public_users.post("/register", (req,res) => {
  return res.status(300).json({message: "Yet to be implemented"});
});

const getBooks = new Promise((resolve) => {
  resolve(books)
})

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks()
    .then(syncBooks => {
      return res.status(300).json(JSON.stringify(syncBooks, null, 4));
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  getBooks()
    .then(syncBooks => {
      return res.status(300).json(JSON.stringify(syncBooks[isbn]));
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author
    const book = books.findOne(book => book.author == author)
    getBooks()
      .then(syncBooks => {
        const book = syncBooks.findOne(book => book.author == author)
        return res.status(300).json(JSON.stringify(book));
      })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title
    const book = books.findOne(book => book.title == title)
  return res.status(300).json(JSON.stringify(book));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    const review = book[isbn]?.review || {}
  return res.status(300).json(JSON.stringify(review));
});

module.exports.general = public_users;
