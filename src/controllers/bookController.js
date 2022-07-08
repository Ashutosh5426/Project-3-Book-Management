const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
const moment = require("moment")

let checkName = /^[A-Za-z\s]+$/
// let nameRegex = /^[.a-zA-Z\s,-]+$/
// let isbnRegex = /(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)/
let isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/

const today = moment()



const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const createBook = async function (req, res) {
    try {
        let data = req.body
        if (!data)
            return res.status(400).send({ status: false, message: "Please enter the requied field ⚠️" });

        const { title, excerpt, userId, ISBN, category, subcategory } = data


        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Please enter valid titel. ⚠️" })
        if (!data.title.match(checkName))
            return res.status(400).send({ status: false, message: "name should contain alphabets only. ⚠️" })

        if (!isValid(excerpt))
            return res.status(400).send({ status: false, message: "Please enter some excerpt. ⚠️" })

        if (!isValid(userId))
            return res.status(400).send({ status: false, message: "Please enter the user. ⚠️" })

        if (!isValid(ISBN))
            return res.status(400).send({ status: false, message: "Please enter the ISBN. ⚠️" })
        if (!data.ISBN.match(isbnRegex))
            return res.status(400).send({ status: false, message: "You entered a invalid ISBN. ⚠️" })


        if (!isValid(category))
            return res.status(400).send({ status: false, message: "Please enter the category. ⚠️" })

        if (!isValid(subcategory))
            return res.status(400).send({ status: false, message: "Please enter the subcategory. ⚠️" })

        if (data.userId !== req.userId1)
            return res.status(401).send({ Status: false, message: "Authorisation Failed ⚠️" })


        if (data.releasedAt === true) {
            data.releasedAt = today.format("YYYY-MM-DD") //-----------------?????????
        }

        let title1 = await bookModel.findOne({ title: title })
        if (title1)
            return res.status(400).send({ status: false, message: "This Title is already used. ⚠️" })

        let ISBN1 = await bookModel.findOne({ ISBN: ISBN })
        if (ISBN1)
            return res.status(400).send({ status: false, message: "ISBN should be Unique ⚠️" })


        let bookCreated = await bookModel.create(data)
        return res.status(201).send({ status: true, message: "success", data: bookCreated })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateBook = async function (req, res) {
    try {
        let data = req.body
        let bookId = req.params.bookId
        if (Object.keys(data).length == 0)
            return res.status(404).send({ Status: false, message: "No data for Update ⚠️" })

        if (!mongoose.isValidObjectId(bookId))
            return res.status(400).send({ Status: false, message: "Please enter valid bookId ⚠️" })
        const { title, ISBN, excerpt } = data //----------destructure

        if(title==""){
            return res.status(400).send({status: false, message: "Title must contain the title name,"})
        }

        if (title) {
            let findtitle = await bookModel.findOne({ title: title })
            if (findtitle) { return res.status(400).send({ status: false, message: "please change your title, It is already exists" }) }
        }

        // if()

        if (isValid(ISBN) && !ISBN.match(isbnRegex))
            return res.status(400).send({ status: false, message: "You entered a invalid ISBN. ⚠️" })
        if (ISBN) {
            let findISBN = await bookModel.findOne({ ISBN: ISBN })
            if (findISBN) { return res.status(400).send({ status: false, message: "please change your ISBN No., It is already exists" }) }
        }

        let findbook = await bookModel.findById(bookId)
        if (!findbook)
            return res.status(404).send({ msg: "bookId  is invalid ⚠️" })

        if (findbook.userId!= req.userId1)
            return res.status(401).send({ Status: false, message: "Authorisation Failed ⚠️" })

        if (findbook.isDeleted == true)
            return res.status(404).send({ msg: "Bookdata is already deleted ⚠️" })

        if (findbook.isDeleted == false) {
            let updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {
                $set: {
                    title: title,
                    excerpt: excerpt,
                    ISBN: ISBN,
                    releasedAt: today.format("YYYY-MM-DD")
                },

            }, { new: true, upsert: true })
            return res.status(200).send({ status: true, msg: updatedBook })
        }

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}
//--------------------------------------------------------------------------------------------------------------------------------

let getbyBookId= async function(req,res){
    try {
        let bookId = req.params.bookId
        if(!mongoose.isValidObjectId(bookId)){return res.status(400).send({status : false, msg : "You entered a invalid BookId"})}

        let bookData = await bookModel.findOne({_id : bookId}).select({_v : 0})
     
    if(!bookData){return res.status(404).send({status : false, msg : "No book found"})}

    let findReview = await reviewModel.find({bookId : bookId})

   

   bookData["reviewsData"]=findReview
    return res.status(200).send({status : true, message : "Book Lists", data : bookData})
     
    // let object = {
    //     _id: bookData._id,
    //     title: bookData.title,
    //     excerpt: bookData.excerpt,
    //     userId: bookData.userId,
    //     category:bookData.category,
    //     subcategory: bookData.subcategory,
    //     isDeleted: bookData.isDeleted,
    //     reviews: bookData.reviews,
    //     releasedAt: bookData.releasedAt,
    //     createdAt: bookData.createdAt,
    //     updatedAt: bookData.updatedAt,
    //     reviewsData : findReview
    // }

    return res.status(200).send({status : true, message : "Book Lists", data : object})
    }
    catch(err) {
        res.status(500).send({error : err.message})
    }

}
//--------------------------------------------------------------------------------------------------//
let getBooks = async function(req,res){
    let queryData=req.query
    let userId=queryData.userId
    let category=queryData.category
    let subcategory=queryData.subcategory


    if(!queryData){
        let findData= await bookModel.find({isDeleted : false}).select({_id:1,title:1,excerpt:1,userId:1,category:1,reviews:1,releasedAt:1})
 
        return res.status(200).send({status : true, message : "Book Lists", data : findData})

    }
    if(userId){
    if(!mongoose.isValidObjectId(userId)){return res.status(400).send({status : false, msg : "You entered a invalid UserId ......"})}
    let check = await userModel.findById(userId)
    if(!check){return res.status(400).send({status : false, msg : "No such userId is exists"})}
    }

    let findData= await bookModel.find({$and : [queryData,{isDeleted : false}]}).select({_id:1,title:1,excerpt:1,userId:1,category:1,reviews:1,releasedAt:1})

    if(findData.length==0){
        return res.status(404).send({status : false, msg : "No book found"})
    } else{
        return res.status(200).send({status : true, message: 'Books list', data : findData})
    }

    }

    



const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!mongoose.isValidObjectId(bookId))
            return res.status(400).send({ Status: false, message: "Please enter valid bookId ⚠️" })

        let data = await bookModel.findById(bookId)
        if (!data)
            return res.status(404).send({ status: false, msg: "id does not exist ⚠️" })

        if (data.userId != req.userId1)
            return res.status(401).send({ Status: false, message: "Authorisation Failed ⚠️" })


        if (data) {
            if (data.isDeleted == false) {
                await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
                res.status(200).send({ status: true, msg: "data deleted ⚠️" })
            } else {
                res.status(200).send({ status: false, msg: "data already deleted ⚠️" })
            }
        }

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}






// module.exports.createBook = createBook
// module.exports.updateBook = updateBook
// module.exports.getBooks = getBooks
// module.exports.deleteBook = deleteBook
module.exports = { createBook, updateBook, getBooks, deleteBook,getbyBookId }