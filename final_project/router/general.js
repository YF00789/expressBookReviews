const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      let present = users.filter((user) => user.username === username);
      
      if (present.length === 0) {
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  
  return res.status(404).json({message: "Unable to register user. Please provide username and password"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
        resolve(books);
    });

    getBooksPromise.then((bookList) => {
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    }).catch((error) => {
        return res.status(500).json({message: "Error retrieving books"});
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    
    const getBookPromise = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });

    getBookPromise.then((bookDetails) => {
        return res.status(200).json(bookDetails);
    }).catch((error) => {
        return res.status(404).json({message: error});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
    
    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let booksByAuthor = [];
      
        keys.forEach(key => {
            if (books[key].author === author) {
                booksByAuthor.push({
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });
        
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found by this author");
        }
    });

    getBooksByAuthorPromise.then((booksList) => {
        return res.status(200).json({booksbyauthor: booksList});
    }).catch((error) => {
        return res.status(404).json({message: error});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
    
    const getBooksByTitlePromise = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let booksByTitle = [];
      
        keys.forEach(key => {
            if (books[key].title === title) {
                booksByTitle.push({
                    isbn: key,
                    author: books[key].author,
                    reviews: books[key].reviews
                });
            }
        });
        
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject("No books found with this title");
        }
    });

    getBooksByTitlePromise.then((booksList) => {
        return res.status(200).json({booksbytitle: booksList});
    }).catch((error) => {
        return res.status(404).json({message: error});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
