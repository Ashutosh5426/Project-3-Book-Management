const user = require('../models/userModel.js')
const emailValidate = require('email-validator')

const createUser = async function(req,res){
    try {
        let bodyData = req.body

    if(Object.keys(bodyData).length==0){return res.status(400).send({status : false, msg : "Bad request, please enter details in the Request Body"})}

    let title=bodyData.title
    if(!title){return res.status(400).send({status : false, msg : "Title field is required"})}

    let check=["Mr","Miss","Mrs"]

    if(!title==check.find(element=>title==element)){return res.status(400).send({status : false, msg : "Title must be present in Mr/Miss/Mrs only"})}

    let name=bodyData.name
    if(!name){return res.status(400).send({status : false, msg : "name field is Required"})}
  
    function validateName(name) 
    {
        var checkName = /^[A-Za-z\s]+$/;
        return re.test(checkName);
    }
    if(checkName==false){return res.status(400).send({status : false, msg : "You entered a invalid Name"})}

    let phone=bodyData.phone

    if(!phone){return res.status(400).send({status : false, msg : "phone field is Required"})}
   
    function validatePhone(phone) 
    {
        var checkPhone = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        return re.test(checkPhone);
    }
   
    if(checkPhone==false){return res.status(400).send({status : false, msg : "You entered a invalid Phone Number"})}

    let findPhone = await user.findOne({phone : phone})
    if(findPhone){return res.status(400).send({status : false, msg : "This phone Number is already exists"})}
   
    let email=bodyData.email

    if(!email){return res.status(400).send({status : false, msg : "email field is Required"})}
   let checkEmail=emailValidate.validator(email)
   if(checkEmail==false){return res.status(400).send({status : false, msg : "You entered a invalid EmailId"})}
   
    let findEmail = await user.findOne({email : email})
    if(findEmail){return res.status(400).send({status : false, msg : "This EmailId is already exists"})}
    
   if(!password){return res.status(400).send({status : false, msg : "Password field is Required"})}
   if(!password.length>=8 && password.length<=15){return res.status(400).send({status: false, msg : "Password length is appropriate, it must be between 8 and 15 Both value is inclusive"})}
    
   let createUserData = await user.create(bodyData)
   res.status(201).send({status : true, message : "success", data : crateUserData})
}
catch(err) {
    res.status(500).send({error : err.messaage})
}
}

let loginUser = async function(req,res){
    let loginData = req.body
    if(Object.keys(loginData).length==0){return res.status(400).send({status : false, msg: " Please enter email and password in the Request Body"})}
   let email=loginData.email
   let password = loginData.password
    if(!email){return res.status(400).send({status : false, msg : "email field is Required"})}
    if(!password){return res.status(400).send({status : false, msg : "password field is Required"})}

    let user = await user.findOne({email:email,password:})
    if(!user){return res.status(400).send({status : false, msg : "You entered a wrong Login Credentials"})}
    
    let token = jwt.sign(
        {
          userId: user._id.toString(),
          
        },
        "functionup-radon"
      );
      res.setHeader("x-api-key", token);
      res.status(201).send({ status: true, data: {token: token }});
      
}

module.exports.registerUser=createUser
module.exports.loginUser=loginUser