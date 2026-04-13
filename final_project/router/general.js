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
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn
  try {
    const { data: allBooks } = await axios.get("http://localhost:5001/");
    const book = allBooks[isbn];
    if (!book) {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve books by ISBN",
      error: error.message
    });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author
  try {
    const { data: allBooks } = await axios.get("http://localhost:5001/");
    const booksArr = Object.values(allBooks);
    const matches = booksArr.filter(book => book.author == author);
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve books by author",
      error: error.message
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title
  try {
    const { data: allBooks } = await axios.get("http://localhost:5001/");
    const booksArr = Object.values(allBooks);
    const matches = booksArr.filter(book => book.title == title);
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve books by title",
      error: error.message
    });
  }
});

// Add or modify a book review
public_users.put('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const reviewText = req.query.review || req.body?.review || req.body;
  if (!books[isbn]) {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
  const reviewUser = req.body?.username || "anonymous";
  books[isbn].reviews = {
    ...(books[isbn].reviews || {}),
    [reviewUser]: reviewText
  };
  return res.status(200).json({
    message: `Review for ISBN ${isbn} added or updated`,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
public_users.delete('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
  const reviewUser = req.body?.username || "anonymous";
  delete books[isbn]?.reviews?.[reviewUser];
  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted`
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const review = books[isbn]?.reviews || {}
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
