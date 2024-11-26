const express = require('express');
const router = express.Router();
const Book = require('../models/Book'); 

// Define routes here
router.get('/books', paginatedResults(Book), (req, res) => {
  res.json(res.paginatedResults)
})

router.post('/books', async (req, res) => {
  const { title, author, genre, publishedYear, isAvailable } = req.body; 

  const newBook = new Book({
    title, 
    author, 
    genre, 
    publishedYear, 
    isAvailable
  })

  newBook
    .save()
    .then((savedBook) => {
      res.status(201).send(savedBook)
    })
    .catch((error) => {
      res.status(500).send(error); 
    })
})

router.get('/books/available', async (req, res) => {
  const books = await Book.find({ isAvailable: true }); 
  res.status(200).send(books); 
})

router.get('/books/:id', async (req, res) => {
  const bookId = req.params.id; 
  const book = await Book.findById(bookId); 

  if (!book) {
    return res.status(404).send('Book not found!'); 
  }

  res.send(book); 
})

router.put('/books/:id', async (req, res) => {
  const { title, author, genre, publishedYear, isAvailable } = req.body;

  const bookId = req.params.id; 

  try {
    const book = await Book.findByIdAndUpdate(bookId); 

    if (!book) {
      res.status(404).send({ error: "Book not found."}); 
    } else {
      book.title = title; 
      book.author = author; 
      book.genre = genre; 
      book.publishedYear = publishedYear; 
      book.isAvailable = isAvailable; 

      await book.save(); 
      return res.status(200).send(book);  
    }
  } catch (error) {
    res.status(500).send(error); 
  }
})

router.delete('/books/:id', async (req, res) => {
  const bookId = req.params.id; 
  
  try {
    const book = await Book.findById(bookId); 

    if (!book) {
      res.status(404).send({ error: "Book not found."})
    } else {
      await Book.findByIdAndDelete(bookId); 
      return res.status(200).send("Book deleted successfully. ")
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error.'}); 
  }
})

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page); 
    const limit = parseInt(req.query.limit); 
  
    const startIndex = (page - 1) * limit; 
    const endIndex = page * limit; 
  
    const results = {}; 
  
    if (endIndex < model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
  
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
   
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}



module.exports = router;
