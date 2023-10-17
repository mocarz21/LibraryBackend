const express = require("express");

var jwt = require("jsonwebtoken");
const router = express.Router();

// const authPost = (endpoint, action) => {
//   router.post(endpoint, authenticate, action);
// };
// const authGet = (endpoint, action) => {
//   router.get(endpoint, authenticate, action);
// };

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.json({
        error: "BAD TOKEN",
      });

    req.userId = decoded.userId;
    next();
  });
};

const BooksController = require("./controllers/books");
router.get("/books/", BooksController.showAll);
router.post("/secure/books", BooksController.save)
router.post("/secure/books/:id/remove", BooksController.remove)
router.get('/books/:id', BooksController.showOne)

const UserController = require("./controllers/users");
router.get("/users/", authenticate, UserController.showAll)
router.post("/authenticate", UserController.authenticate);
router.get("/secure/isLogged/:token", UserController.isLogged);
router.post("/secure/employee/addUser", UserController.save)
router.get("/users/:id", UserController.showOne) 
router.post("/secure/users/:id/remove", UserController.remove) 

const RentalsController = require('./controllers/rentals');
router.get('/rental', RentalsController.showAll);
router.post('/secure/rental', RentalsController.save );
router.get('/secure/rental/:id', RentalsController.showOne);
router.post('/secure/rental/:id/remove', RentalsController.remove);


module.exports = router;