const router = require("express").Router();
var leaderboard = require('../controllers_game/leaderboardController');

router.get("/" , leaderboard.getLeaderboard);

module.exports = router;
