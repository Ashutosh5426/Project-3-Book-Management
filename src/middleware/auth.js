const jwt = require("jsonwebtoken");

module.exports.tokenChecker = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];

    if (!token) {
      return res.status(403).send({ status: false, message: "Missing authentication token in request ⚠️", });
    }

    jwt.verify(token, "functionup-radon", function (err, decoded) {
      if (err) {
        return res.status(400).send({ status: false, message: "token invalid ⚠️" });
      }
      else {
        req.userId1 = decoded.userId;
        return next();
      }
    });

  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};