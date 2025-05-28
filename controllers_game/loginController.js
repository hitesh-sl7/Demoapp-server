const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')

const { sql } = require("@vercel/postgres");

var Login = function(){
};
Login.postLogin = async (req, res) => {
    let buffer;
    try{
        var Reqdata = req.body;
        // var dID = new Buffer.from(Reqdata.request_token.split(".")[1], 'base64').toString();
        // dID = JSON.parse(dID);
        // pid = dID['pr'];
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        var sendData = {};

        var u  = await sql`SELECT * from game_users where email=${Reqdata.email}`;

        console.log(u,Reqdata.email);
        if(u.rowCount){
            uObj = u.rows[0];
            if(uObj.password == Reqdata.password){
                Reqdata.uID = uObj.id;
                Reqdata.username = uObj.username;
                Reqdata.email = Reqdata.email;
                Reqdata.phone = '';
                if(uObj.phone){
                    Reqdata.phone = uObj.phone;
                }
                const astk = jwtGenerator(Reqdata.uID);
                Reqdata.session_id = astk;
                var respData = await Login.sendLoginData("login_succeeded",Reqdata);
                sendData.status = respData.status;
                sendData.severity = respData.severity;
                sendData.loginstatus = 'login_succeeded';
                sendData.device = respData.device;
                sendData.request = Reqdata;
                sendData.message = "Login Request successfully reached.";
            }else{
                await Login.sendLoginData("login_failed",Reqdata);
                sendData.loginstatus = 'login_failed';
                sendData.request = Reqdata;
                sendData.message = "Incorrect password";
            }
        }else{
            await Login.sendLoginData("login_failed",Reqdata);
            sendData.loginstatus = 'login_failed';
            sendData.request = Reqdata;
            sendData.message = "User not found";
        }

        return res.status(200).send(sendData);
}
    catch (err) 
    {
        console.error(err.message);
        retMsg = {};
        retMsg.status = 500;
        retMsg.message = err.message;
        return res.status(200).send(retMsg);
    }
}

Login.sendLoginData = async(status,data) => {
    try 
    {
        var auth_key = '';
        var plt = '';
        var token = '';
        var domain = 'https://mdev.sensfrx.ai/v1/login';

        var dID = new Buffer.from(data.request_token.split(".")[1], 'base64').toString();
        dID = JSON.parse(dID);
        plt = dID['plt'];
        pid = dID['pr'];

        token = "8362394223694836:0ZBR2eEBI6royEpY:" + plt;
        auth_key = new Buffer.from(token).toString('base64');

        const headers = {
            'Content-Type': 'application/json',
            'authorization': auth_key,
            "package":  data.package,
            };
        // console.log(headers);
        const body = {
            "ev": status,
            "uID": data.uID,
            "dID" : data.request_token,
            "d_f" : data.d_f,
            "uex": {
            "email": data.email,
            "username": data.username,
            "phone" : data.phone
            }
        }

        const response = await axios.post(domain, body,{ headers: headers });
        console.log(`statusCode: ${response.status}`);
        console.log(response.data,"---------response ");
        return response.data;
    } 
    catch (err) 
    {
        console.log(err.message);
        return err.message
    
    }
};

module.exports = Login;