const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({
      message: "Bad request - username and password are required"
    })
  }
  if (!isValid(username)) {
    res.status(401).json({
      message: "Username already taken"
    })
  }
  users.push({
    username,
    password
  });
  return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

const getBooks = () => {
  return new Promise((resolve) => {
    resolve(books)
  })
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks()
    .then(syncBooks => {
      return res.status(200).json(syncBooks);
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn
  getBooks()
    .then(syncBooks => {
      return res.status(200).json(syncBooks[isbn]);
    })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author
  getBooks()
    .then(syncBooks => {
      const books = Object.values(syncBooks)
      const book = books.find(book => book.author == author)
      return res.status(200).json(book);
    })
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title
  const booksArr = Object.values(books)
  const book = booksArr.find(book => book.title == title)
  return res.status(200).json(book);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const review = books[isbn]?.review || {}
  return res.status(200).json(review);
});


const axiosImplementation = async () => {
  try {
    const { data: allBooks } = await axios({
      method: 'get',
      url: 'http://localhost:5001/',
    })
    console.log("allBooks: ", allBooks)
  } catch (error) {
    console.log("allBooks error: ", error)
  }

  try {
    const { data: bookByIsbn } = await axios({
      method: 'get',
      url: 'http://localhost:5001/isbn/2',
    })
    console.log("bookByIsbn: ", bookByIsbn)
  } catch (error) {
    console.log("bookByIsbn error: ", error)
  }

  try {
    const { data: bookByAuthor } = await axios({
      method: 'get',
      url: 'http://localhost:5001/author/Samuel%20Beckett',
    })
    console.log("bookByAuthor: ", bookByAuthor)
  } catch (error) {
    console.log("bookByAuthor error: ", error)
  }

  try {
    const { data: bookByTittle } = await axios({
      method: 'get',
      url: 'http://localhost:5001/title/The%20Divine%20Comedy',
    })
    console.log("bookByTittle: ", bookByTittle)
  } catch (error) {
    console.log("bookByTittle error: ", error)
  }
}

axiosImplementation()
  .then(() => "finished")


module.exports.general = public_users;
