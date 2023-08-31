const router = require("express").Router();
var login = require('../controllers/loginController');

router.post("/" , login.loginLog);

module.exports = router;
