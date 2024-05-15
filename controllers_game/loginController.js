const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
// const sqlite3 = require('sqlite3');

// const CyclicDB = require('@cyclic.sh/dynamodb');
// const dynamodb = CyclicDB('lime-stormy-pandaCyclicDB');

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

        // let users = dynamodb.collection('users');
        // let u = await users.get(Reqdata.email);

        // if(u){
        //     if(u.props.password == Reqdata.password){
        //         sendData.loginstatus = 'login_succeeded';
        //         sendData.user_info = {
        //             "uID" : u.props.id,
        //             "username" : u.props.username,
        //             "phone" : u.props.phone,
        //             "email" : u.props.email,
        //         }
        //         // sendData.request = Reqdata;
        //         sendData.message = "Login Request successfully reached.";
        //     }else{
        //         sendData.loginstatus = 'login_failed';
        //         sendData.request = Reqdata;
        //         sendData.message = "Incorrect password";
        //     }
        // }else{
        //     sendData.loginstatus = 'login_failed';
        //     sendData.request = Reqdata;
        //     sendData.message = "User not found";
        // }

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