const user = require('../models/userModel.js')
const emailValidate = require('email-validator')
const jwt = require('jsonwebtoken')

const registerUser = async function (req, res) {
    try {
        let bodyData = req.body
        // console.log(bodyData)
        if (Object.keys(bodyData).length == 0) { return res.status(400).send({ status: false, msg: "Bad request, please enter details in the Request Body" }) }

        let title = bodyData.title
        if (!title) { return res.status(400).send({ status: false, msg: "Title field is required" }) }

        let check = ["Mr", "Miss", "Mrs"]
        let checkEnum = await check.find(element => element == title)
        if (!checkEnum) { return res.status(400).send({ status: false, msg: "Title must be present in Mr/Miss/Mrs only" }) }
        // console.log("abcd3")
        let name = bodyData.name
        if (!name) { return res.status(400).send({ status: false, msg: "name field is Required" }) }


        var checkName = /^[A-Za-z\s]+$/;

        if (!checkName.test(name)) { return res.status(400).send({ status: false, msg: "You entered a invalid Name" }) }

        // console.log("abcd")
        let phone = bodyData.phone

        if (!phone) { return res.status(400).send({ status: false, msg: "phone field is Required" }) }
        if (phone.length != 10) { return res.status(400).send({ status: false, msg: "You entered an invalid Phone Number" }) }

        var checkPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

        if (!checkPhone.test(phone)) { return res.status(400).send({ status: false, msg: "You entered a invalid Phone Number" }) }

        let findPhone = await user.findOne({ phone: phone })
        if (findPhone) { return res.status(400).send({ status: false, msg: "This phone Number is already exists" }) }
        // console.log("abc1")
        let email = bodyData.email

        if (!email) { return res.status(400).send({ status: false, msg: "email field is Required" }) }
        let checkEmail = emailValidate.validate(email)
        if (checkEmail == false) { return res.status(400).send({ status: false, msg: "You entered a invalid EmailId" }) }

        let findEmail = await user.findOne({ email: email })
        if (findEmail) { return res.status(400).send({ status: false, msg: "This EmailId is already exists" }) }
        // console.log("abc2")
        let password = bodyData.password
        if (!password) { return res.status(400).send({ status: false, msg: "Password field is Required" }) }
        if (!(password.length>=8 && password.length<=15)) { return res.status(400).send({ status: false, msg: "Password length is appropriate, it must be between 8 and 15 Both value is inclusive" }) }
        // console.log("abc3")
        let createUserData = await user.create(bodyData)

        res.status(201).send({ status: true, message: "success", data: createUserData })

    }
    catch (err) {
        res.status(500).send({ error: err.messaage })
    }
}




let loginUser = async function (req, res) {
    let loginData = req.body
    if (!loginData) { return res.status(400).send({ status: false, msg: " Please enter email and password in the Request Body" }) }
    let email = loginData.email
    let password = loginData.password
    if (!email) { return res.status(400).send({ status: false, msg: "email field is Required" }) }
    if (!password) { return res.status(400).send({ status: false, msg: "password field is Required" }) }

    let user1 = await user.findOne({ email: email, password: password })
    if (!user1) { return res.status(400).send({ status: false, msg: "You entered a wrong Login Credentials" }) }

    let token = jwt.sign(
        {
            userId: user1._id.toString(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) * 1 * 1 * 60,

        },
        "functionup-radon"

    );
    res.status(201).send({ status: true, data: { token: token } });

}

module.exports.registerUser = registerUser
module.exports.loginUser = loginUser