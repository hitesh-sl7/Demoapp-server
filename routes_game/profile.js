const router = require("express").Router();
var profile = require('../controllers_game/profileController');

router.get("/" , profile.getProfile);

module.exports = router;
