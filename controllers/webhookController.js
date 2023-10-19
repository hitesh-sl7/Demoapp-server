
const alerts = [];

var Webhook = function(){
};
Webhook.webhookReceive = async (req, res) => {
    var Reqdata = req.body;
    alerts.push(Reqdata);
    console.log(Reqdata,"------------- webhook received");
    return res.status(200).send(Reqdata);
};

Webhook.webhookSend = async (req, res) => {
    var user_id = req.query['user_id'];
    const SendData = [];
    alerts.forEach(log => {
        console.log(log['user']['user_id']);
        console.log(parseInt(log['user']['user_id']) , parseInt(user_id));
        if(parseInt(log['user']['user_id']) == parseInt(user_id)){
            SendData.push(log);
        }
      });
    alerts.length = 0;
    console.log(SendData,"------------- webhook sent");
    return res.status(200).send(SendData);
};

module.exports = Webhook;