const router = require("express").Router();
var webhook = require('../controllers/webhookController');

router.post("/" , webhook.webhookLog);

module.exports = router;
