
var Webhook = function(){
};
Webhook.webhookReceive = async (req, res) => {
    var Reqdata = req.body;
    console.log(Reqdata,"------------- webhook received");
    return res.status(200).send(Reqdata);
};

Webhook.webhookSend = async (req, res) => {
    var Reqdata = req.body;
    console.log(Reqdata,"------------- webhook sent");
    return res.status(200).send(Reqdata);
};

module.exports = Webhook;