const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel');


/*********************************addBookReview*************************************/
// Review request should accept only numbers. Add a Validation for it.
let addBookReview = async function (req, res){
  try{
    let reviewData = req.body;
    let bookId = req.params.bookId;
    // let review = reviewData.review;
    // let rating = reviewdata.rating;
    // let reviewerName = reviewData.reviewedBy;
    let {review, rating, reviewedBy} = reviewData;

    if(!Object.keys(reviewData).length){
       return res.status(400).send({status: true, message: 'Bad Request, Please enter the details in the request body.'})
    }

    if(!review){
      return res.status(400).send({status: false, message: 'Review should be present.'})
    }
    if(review.trim().length == 0){
      return res.status(400).send({status: false, message: 'Review field should be empty.'})
    }

    if(!rating){
      return res.status(400).send({status: false, message: ''})
    }
    if(rating<1 || rating>5){
      return res.status(400).send({status: false, message: 'Rating should be between 1 and 5 inclusively.'})
    }

    if(reviewedBy.trim().length == 0){
      return res.status(400).send({status: false, message: "Reviewer's should not be empty."});
    }

    let bookData = await bookModel.findOne({_id: bookId});
    if(!bookData){
      return res.status(400).send({status: false, message: 'Could not find the book with the given bookId'});
    }
    if(bookData.isDeleted){
      return res.status(400).send({status: false, message: 'This book has been deleted.'});
    }
    let updatedBookData = await bookModel.findOneAndUpdate({_id: bookId}, {$inc: {reviews: 1}}, {new: true, upsert: true});

    let addReviewData = await reviewModel.create(reviewData);

    let responseData = { // What should be the format of response data
      updatedBookDocument: updatedBookData,
      reviewsData: addReviewData
    }

    res.status(201).send({status: true, message: "Success", data: responseData});
  }
  catch(err){
    return res.status(500).send({status: false, message: err.message});
  }
}

/********************************updateBookReview***********************************/

let updateBookReview = async function (req, res){
  let dataToUpdate = req.body;
  let bookId = req.params.bookId;
  let reviewId = req.params.reviewId;
  
  // let review = dataToUpdate.review;
  // let rating = dataToUpdate.rating;
  // let reviewerName = dataToUpdate.reviewerName;
  
  if(!Object.keys(dataToUpdate).length){
    return res.status(400).send({status: false, message: 'Bad Request, Please enter the details in the request body.'});
  }
  
  let {review, rating, reviewedBy} = dataToUpdate;  // Are all compulsary.
  if(review.trim().length == 0){
    return res.status(400).send({status: falsse, message: 'Review field should not be empty.'});
  }

  if(rating<1 || rating>5){
    return res.status(400).send({status: false, message: 'Rating should be in range (1, 5) inclusively.'});
  }

  // if(reviewedBy.trim().length == 0){
  //   return res.status(400).send({status: false, message: 'Reviewed field should not be empty.'});
  // }

  let BookData = await bookModel.findOne({_id: bookId});
  if(!BookData){
    return res.status(400).send({status: false, message: 'Book does not exist with the given bookId'});
  }
  if(BookData.isDeleted){
    return res.status(400).send({status: false, message: 'Cannot Update! The book is deleted before.'});
  }
  let reviewData = await reviewModel.findOne({_id: reviewId});
  if(reviewData.review){
    return res.status(400).send({status: false, message: 'Cannot Update! Review is already given to this book.'});
  }
  let updatedReviewData = await reviewModel.findOneAndUpdate({_id: reviewId}, {
    $set: {
      review: review,
      rating: rating,
      reviewedBy: reviewerName
    }
  }, {new: true, upsert: true})     // What should be in return data
  return res.status(200).send({status: true, message: 'Book list', data: updatedReviewData});
}

/*********************************deleteBookReview**********************************/

const deleteBookReview = async function (req, res){
  let bookId = req.params.bookId;
  let reviewId = req.params.reviewId;  // do we need to give validation for bookId and reviwId

  let checkBook = await bookModel.findOne({_id: bookId});
  if(!checkBook){
    return res.status(400).send({status: true, message: 'The book does not exists with the given bookId.'});
  }
  let checkReview = await reviewModel.findOne({_id: reviewId});
  if(!checkReview){
    return res.status(400).send({status: false, message: 'The review does not exist with the given reviewId.'});
  }

  let deletedReviewData = await reviewModel.findOneAndUpdate({_id: reviewId}, {
    $set: {isDeleted: true}
  }, {new: true, upsert: true}) // Is it right adding upsert: true
  let updatedBookData = await bookModel.findOneAndUpdate({_id: bookId},{
    $inc: {
      reviews: -1
    }
  }, {new: true, upsert: true})

  return res.status(200).send({status: true, message: 'Success', Data: {
    UpdatedBookData: updatedBookData,
    deletedReviewData: deletedReviewData
  }})
}

module.exports = {addBookReview, updateBookReview, deleteBookReview};