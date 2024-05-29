const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
// const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
var fs = require("fs");
const AWS = require("aws-sdk");
const forge = require('node-forge');

const s3 = new AWS.S3()

const { sql } = require("@vercel/postgres");


var Login = function(){
};
Login.loginLog = async (req, res) => {
    try{
        var Reqdata = req.body;
        var dID = new Buffer.from(Reqdata.request_token.split(".")[1], 'base64').toString();
        dID = JSON.parse(dID);
        pid = dID['pr'];
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        var passed = 0;
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);

        var u  = await sql`SELECT * from users where email=${Reqdata.email}`;

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
                var sendData = {};
                sendData.status = respData.status;
                sendData.severity = respData.severity;
                sendData.loginstatus = 'login_succeeded';
                sendData.device = respData.device;
                sendData.request = Reqdata;
                sendData.message = "Login Request successfully reached.";
            }else{
                await Login.sendLoginData("login_failed",Reqdata);
                var sendData = {};
                sendData.status = 'allow';
                sendData.severity = 'low';
                sendData.loginstatus = 'login_failed';
                sendData.device = {};
                sendData.request = Reqdata;
                sendData.message = "Incorrect password";
            }
        }else{
            await Login.sendLoginData("login_failed",Reqdata);
            var sendData = {};
            sendData.status = 'allow';
            sendData.severity = 'low';
            sendData.loginstatus = 'login_failed';
            sendData.device = {};
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

        if(pid == "21" || pid == 21){ 
            token = "9153477437238592:zzuVeKSXMdGdMz5C:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "22" || pid == 22){
            token = "3764534847133574:VGF9TR2qfOnGCE0l:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "674" || pid == 674){
            token = "9384118948554152:gSOM4MSvYPtyQAHD:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "23" || pid == 23){
            token = "9961982276966394:nxkf31HgRA7wAARz:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "800" || pid == 800){
            token = "6117992428568284:Sgp7TPnZ2Sd52KQd:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "803" || pid == 803){
            token = "9366637327789593:jGprZeLjZWUp0lXx:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "720" || pid == 720){
            token = "5916688855237721:IzfVF8xbpNsn1zcP:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
            domain = 'https://m.sensfrx.ai/v1/login';
        }else if(pid == "722" || pid == 722){
            token = "7838156638213257:CsFqXOfLIhc274J7:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
            domain = 'https://m.sensfrx.ai/v1/login';
        }

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
            "df" : data.d_f,
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