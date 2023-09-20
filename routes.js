const express = require("express");

const router = express.Router();

const BooksController = require("./controllers/books");
router.get("/books/", BooksController.showAll);


module.exports = router;