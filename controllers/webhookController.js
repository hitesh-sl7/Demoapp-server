
const alerts = [];

var Webhook = function(){
};
Webhook.webhookReceive = async (req, res) => {
    console.log(alerts,"------------- webhook received API");
    var Reqdata = req.body;
    if(Reqdata['status'] != "allow"){
        alerts.push(Reqdata);
        console.log(Reqdata,"------------- webhook received");
    }else{
        for (let i = alerts.length - 1; i >= 0; i--) {
            if (parseInt(alerts[i]['user']['user_id']) === parseInt(Reqdata['user']['user_id'])) {
                SendData = alerts[i];
                alerts.splice(i, 1);
                console.log(Reqdata,"------------- webhook removed");
            }
        }
    }
    
    return res.status(200).send(Reqdata);
};

Webhook.webhookSend = async (req, res) => {
    console.log(alerts,"------------- webhook send API");
    var user_id = "";
    if(req.query['u_id']){
        user_id = req.query['u_id'];
    }
    var SendData = {"status":"","severity":"","device":{"device_id":"","ip":"","location":", "},"user":{"user_id":user_id.toString(),"email":"","username":""},"message":""};
    for (let i = alerts.length - 1; i >= 0; i--) {
        if (parseInt(alerts[i]['user']['user_id']) === parseInt(user_id)) {
            SendData = alerts[i];
            alerts.splice(i, 1);
        }
    }
    console.log(SendData,"------------- webhook sent");
    return res.status(200).send(SendData);
};

module.exports = Webhook;