const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const bookModel = require("../models/bookModel")
let checkName = /^[A-Za-z\s]+$/
// let nameRegex = /^[.a-zA-Z\s,-]+$/
// let isbnRegex = /(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)/
let isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/



const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const createBook = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, message: "Please enter the requied field ⚠️" });

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data


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

        if (data.releasedAt === true)
            data.releasedAt = Date.now()

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


module.exports.createBook = createBook