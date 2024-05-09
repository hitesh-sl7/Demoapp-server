const router = require("express").Router();
var Questions = require('../controllers_game/questionController');

router.get("/" , Questions.getQues);

router.post("/" , Questions.postQues);

module.exports = router;
