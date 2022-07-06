const express = require('express');
const router = express.Router()
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/books', bookController.createBook);
router.get('/books', bookController.getBooks);
router.get('/books/:bookId', bookController.getBookbyBookId);
router.put('/books/:bookId', bookController.updateBook);
router.delete('/books/:bookId', bookController.deleteBook);
router.post('/books/:bookId/review', reviewController.reviewBook);
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview);
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview);

module.exports = router;