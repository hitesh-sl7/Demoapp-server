const router = require("express").Router();
var login = require('../controllers_game/loginController');

router.post("/" , login.postLogin);

module.exports = router;
