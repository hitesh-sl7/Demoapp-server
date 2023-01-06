const router = require("express").Router();
var register = require('../controllers/registerController');

router.post("/" , register.registerLog);

module.exports = router;
