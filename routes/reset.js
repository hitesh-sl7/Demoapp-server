const router = require("express").Router();
var resetpassword = require('../controllers/resetpasswordController');

router.post("/" , resetpassword.resetpasswordLog);

module.exports = router;
