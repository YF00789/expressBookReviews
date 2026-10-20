const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
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

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
    try {
        // Simulate an asynchronous data fetch
        const bookList = await new Promise((resolve, reject) => {
            resolve(books);
        });
        
        // Return the formatted JSON string if successful
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        // Catch and handle any errors during the fetch
        return res.status(500).json({message: "Error retrieving books"});
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    
    try {
        // Simulate an asynchronous lookup for a specific ISBN
        const bookDetails = await new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });
        
        // Return the matched book object
        return res.status(200).json(bookDetails);
    } catch (error) {
        // Catch rejection if the ISBN does not exist in the database
        return res.status(404).json({message: error});
    }
 });
  
// Get book details based on author using async/await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    
    try {
        // Simulate an asynchronous search operation
        const booksList = await new Promise((resolve, reject) => {
            // Retrieve all ISBN keys to iterate through the database
            const keys = Object.keys(books);
            let booksByAuthor = [];
          
            // Filter the database by matching the requested author
            keys.forEach(key => {
                if (books[key].author === author) {
                    booksByAuthor.push({
                        isbn: key,
                        title: books[key].title,
                        reviews: books[key].reviews
                    });
                }
            });
            
            // Resolve with the populated array if matches are found, otherwise reject
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("No books found by this author");
            }
        });

        // Return the filtered list of books
        return res.status(200).json({booksbyauthor: booksList});
    } catch (error) {
        // Handle cases where no books match the author
        return res.status(404).json({message: error});
    }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    
    try {
        // Simulate an asynchronous search operation
        const booksList = await new Promise((resolve, reject) => {
            // Retrieve all ISBN keys to iterate through the database
            const keys = Object.keys(books);
            let booksByTitle = [];
          
            // Filter the database by matching the requested title
            keys.forEach(key => {
                if (books[key].title === title) {
                    booksByTitle.push({
                        isbn: key,
                        author: books[key].author,
                        reviews: books[key].reviews
                    });
                }
            });
            
            // Resolve with the populated array if matches are found, otherwise reject
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject("No books found with this title");
            }
        });

        // Return the filtered list of books
        return res.status(200).json({booksbytitle: booksList});
    } catch (error) {
        // Handle cases where no books match the title
        return res.status(404).json({message: error});
    }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;