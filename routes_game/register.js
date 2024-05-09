const router = require("express").Router();
var register = require('../controllers_game/registerController');

router.post("/" , register.postRegister);

module.exports = router;
