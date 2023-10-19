
var Webhook = function(){
};
Webhook.webhookLog = async (req, res) => {
    var Reqdata = req.body;
    console.log(Reqdata,"------------- webhook response");
    return res.status(200).send(sendData);
};

module.exports = Webhook;