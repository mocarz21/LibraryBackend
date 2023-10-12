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

const UserController = require("./controllers/users");
router.get("/users/", authenticate, UserController.showAll)
router.post("/authenticate", UserController.authenticate);
router.get("/secure/isLogged/:token", UserController.isLogged);
router.post("/secure/employee/addUser", UserController.save)
router.get("/users/:id", UserController.showOne) 
router.post("/secure/users/:id/remove", UserController.remove) 

module.exports = router;