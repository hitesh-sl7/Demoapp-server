const router = require("express").Router();
var webhook = require('../controllers/webhookController');

router.post("/" , webhook.webhookReceive);
router.get("/" , webhook.webhookSend);

module.exports = router;
