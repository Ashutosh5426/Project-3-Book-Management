const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel');
const mongoose=require ('mongoose');
const validators = require('../validator/validator');

var checkName = /^[A-Za-z\s]+$/;

/*********************************addBookReview*************************************/
// Review request should accept only numbers. Add a Validation for it.
let addBookReview = async function (req, res){
  try{
    let reviewData = req.body;
    let bookId = req.params.bookId;

    if (!mongoose.isValidObjectId(bookId)) 
     return res.status(400).send({ status: false, message: "Invalid book id."})

  
    let {review, rating, reviewedBy} = reviewData;
    reviewData.bookId=bookId
    if(!Object.keys(reviewData).length){
       return res.status(400).send({status: true, message: 'Bad Request, Please enter the details in the request body.'})
    }

    if(!review){
      return res.status(400).send({status: false, message: 'Review should be present.'})
    }
    if(review.length == 0){
      return res.status(400).send({status: false, message: 'Review field should not be empty.'})
    }

    if(!rating){
      return res.status(400).send({status: false, message: 'please provide rating'})
    }
    if(rating<1 || rating>5){
      return res.status(400).send({status: false, message: 'Rating should be between 1 and 5 inclusively.'})
    }

    if(reviewedBy.length == 0){
      return res.status(400).send({status: false, message: "Reviewer's should not be empty."});
    }

    let bookData = await bookModel.findOne({_id: bookId});
    if(!bookData){
      return res.status(400).send({status: false, message: 'Could not find the book with the given bookId'});
    }
    if(bookData.isDeleted){
      return res.status(400).send({status: false, message: 'This book has been deleted.'});
    }
    
    let addReviewData = await reviewModel.create(reviewData);
    let countReviews = await reviewModel.find({bookId: bookId, isDeleted: false}).count();
    let updatedBookData = await bookModel.findOneAndUpdate({_id: bookId}, {$set: {reviews: countReviews}}, {new: true, upsert: true});
    
    let responseData = {
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

let updateReview = async function (req, res){
  try{
    let dataToUpdate = req.body;
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    
    // let review = dataToUpdate.review;
    // let rating = dataToUpdate.rating;
    // let reviewerName = dataToUpdate.reviewerName;
    if (!mongoose.isValidObjectId(bookId)) 
     return res.status(400).send({ status: false, message: "Invalid book id."})

     if (!mongoose.isValidObjectId(reviewId)) 
     return res.status(400).send({ status: false, message: "Invalid review id."})

    if(!Object.keys(dataToUpdate).length){
      return res.status(400).send({status: false, message: 'Bad Request, Please enter the details in the request body.'});
    }
    
    let {review, rating, reviewedBy} = dataToUpdate;  // Are all compulsary.
    // if(review.length == 0){
    //   return res.status(400).send({status: falsse, message: 'Review field should not be empty.'});
    // }
  
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
    if(reviewData.bookId != bookId){
      return res.status(400).send({status: false, message: 'BookId from query params does not resemble with reviewId'});
    }
    if(review.trim() == '' || reviewedBy.trim() == ''){
      return res.status(400).send({status: false, message: 'Cannot Update! Field should not be empty.'});
    }
    if(rating){
      console.log(typeof rating)
      if(!Number(rating))
      {
        return res.status(400).
        send({status: false, message: 'Rating Field should contain only number.'});
      }
    }
    // if(reviewedBy){
    //   // if(typeof reviewdBy != String){
    //   //   return res.status(400).send({status: false, message: 'Rating Field should contain only string.'});
    //   // }
    //   if(reviewedBy.trim() == ''){
    //     return res.status(400).send({status: false, message: 'Cannot Update! Field should not be empty.'});
    //   }
    // }
    if(!checkName.test(reviewedBy)){
      return res.status(400).send({status: false, message: 'ReviewedBy must contain alphabets only'})
    }
    if(reviewData.review == review){
      return res.status(400).send({status: false, message: 'Cannot Update! This review is already exist for the given reviewId'});
    }
    let updatedReviewData = await reviewModel.findOneAndUpdate({_id: reviewId}, {
      $set: {
        review: review,
        rating: rating,
        reviewedBy: reviewedBy
      }
    }, {new: true}).select({__v: 0})
   let returnData = {
    BookId: BookData._id,
    title: BookData.title,
    excerpt: BookData.excerpt,
    userId: BookData.userId,
    ISBN: BookData.ISBN,
    category: BookData.category,
    subcategory: BookData.subcategory,
    reviews: BookData.reviews,
    isDeleted: BookData.isDeleted,
    updatedReviewData: updatedReviewData
   }
    return res.status(200).send({status: true, message: 'Book list', data: returnData});
  }
  catch(err){
    return res.status(500).send({status: false, message: err.message});
  }
}

// const updateReview = async function(req,res)
// {
//     try
//     {
//         if(req.params.bookId==undefined)
//             return res.status(400).send({status : false, message : "bookId is required."});
    
//         const bookId = req.params.bookId;
        
//         if(!validators.isValidObjectId(bookId))
//             return res.status(400).send({status : false, message : "The given bookId is not a valid ObjectId."})
        
//         let bookExists = await bookModel.findOne({_id : bookId, isDeleted : false});

//         if(!bookExists)
//             return res.status(404).send({status : false, message : "Book not found!"});

//         if(req.params.reviewId===undefined)
//             return res.status(400).send({status : false, message : "Invalid request parameter. Please provide reviewId."});
        
//         const reviewId = req.params.reviewId;
            
//         if(!validators.isValidObjectId(reviewId))
//             return res.status(400).send({status : false, message : "The given reviewId is not a valid ObjectId."});
        
//         let reviewExists = await reviewModel.findOne({_id : reviewId,bookId,isDeleted : false});
        
//         if(!reviewExists)
//             return res.status(404).send({status : false,message : "Review not found!"});

//         if(!validators.isValidRequestBody(req.body))
//             return res.status(400).send({status : false, message : "Invalid request body. Please provide review details to be updated in request body."});
        
//         let requestBody = req.body;

//         let updatedReviewDetails={};
        
//         if(validators.isValidField(requestBody.review))
//             updatedReviewDetails['review']=requestBody.review;
        
//         if(validators.isValidField(requestBody.rating))
//             updatedReviewDetails['rating']=requestBody.rating;
        
//         if(validators.isValidField(requestBody.reviewedBy))
//             updatedReviewDetails['reviewedBy']=requestBody.reviewedBy;

//         let updatedReview = await reviewModel.findByIdAndUpdate(reviewId,updatedReviewDetails,{new : true});
        
//         return res.status(200).send({status : true, message : "Review updated successfully.",data : updatedReview});
//     }
//     catch(error)
//     {
//         return res.status(500).send({status : false, message : error.message});
//     }
// };

/*********************************deleteBookReview**********************************/

const deleteBookReview = async function (req, res){
  let bookId = req.params.bookId;
  let reviewId = req.params.reviewId;

  if (!mongoose.isValidObjectId(bookId)) 
     return res.status(400).send({ status: false, message: "Invalid book id."})

     if (!mongoose.isValidObjectId(reviewId)) 
     return res.status(400).send({ status: false, message: "Invalid review id."})

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
  }, {new: true, upsert: true})
  let countReviews = await reviewModel.find({bookId: bookId, isDeleted: false}).count();
    let updatedBookData = await bookModel.findOneAndUpdate({_id: bookId}, {$set: {reviews: countReviews}}, {new: true, upsert: true});

  return res.status(200).send({status: true, message: 'Success', Data: {
    UpdatedBookData: updatedBookData,
    deletedReviewData: deletedReviewData
  }})
}

module.exports = {addBookReview, updateReview, deleteBookReview};