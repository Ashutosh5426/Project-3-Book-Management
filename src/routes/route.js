const express = require('express');
const router = express.Router()
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const commonMiddleware = require("../middleware/auth")

//-----------------------------usercontroller--------------------------------------------------------------//
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

//----------------------------------------bookcontroller---------------------------------------------------------------//

router.post('/books', commonMiddleware.tokenChecker, bookController.createBook);
router.get('/books', commonMiddleware.tokenChecker, bookController.getBooksByQuery);
router.get('/books/:bookId', commonMiddleware.tokenChecker, bookController.getbyBookId);
router.put('/books/:bookId', commonMiddleware.tokenChecker, bookController.updateBook);
router.delete('/books/:bookId', commonMiddleware.tokenChecker, bookController.deleteBook);

//--------------------------------reviewcontroller------------------------------------------------------------------------------//

router.post('/books/:bookId/review', reviewController.addBookReview);
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview);
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteBookReview);

module.exports = router;