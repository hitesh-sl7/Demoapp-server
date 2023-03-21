const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
var fs = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3()

var Login = function(){
};
Login.loginLog = async (req, res) => {
    try{
        var Reqdata = req.body;
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        var passed = 0;
        Reqdata.ip = requestIp.getClientIp(req);
        var user = parseInt(Reqdata.email.slice(5,));
        var pass = parseInt(Reqdata.password.slice(5,));
        if((user <= 50) && (pass <= 50) && (user == pass)){
            const astk = jwtGenerator(user);
            Reqdata.uID = user;
            Reqdata.username = Reqdata.email;
            Reqdata.email = Reqdata.email + "@yopmail.com";
            Reqdata.session_id = astk;
            passed = 1;
        }else{
            // var data = Reqdata.email + ":" + Reqdata.password;
            my_file = await s3.getObject({
                Bucket: "cyclic-lime-stormy-panda-ap-south-1",
                Key: "some_files/users.json",
            }).promise()

            var users = new Buffer.from(my_file['Body']).toString();
            users = JSON.parse(users)

            if(users[Reqdata.email]){
                if(users[Reqdata.email]['password'] == Reqdata.password){
                    Reqdata.uID = users[Reqdata.email]['id'];
                    Reqdata.username = users[Reqdata.email]['username'];
                    Reqdata.email = Reqdata.email;
                    const astk = jwtGenerator(Reqdata.uID);
                    Reqdata.session_id = astk;
                    passed = 1;  
                }
            }
        }
        // const content = await fs.readFileSync('users.txt',{encoding:'utf8', flag:'r'});
        // Allcontent = content.split("\n");
        //         i = 51;
        //         Allcontent.forEach(function(value){
        //                 // console.log(value);
        //                 try{
        //                 if(value.split(";")[1] == data){
        //                     Reqdata.uID = i;
        //                     Reqdata.username = value.split(";")[0] ;
        //                     Reqdata.email = Reqdata.email;
        //                     const astk = jwtGenerator(Reqdata.uID);
        //                     Reqdata.session_id = astk;
        //                     passed = 1;     
        //                 };
        //             }catch(err){                   
        //             }
        //                 i += 1;
        //         });

        if(passed == 1){
            Login.sendLoginData("login_succeeded",Reqdata);
            var sendData = {};
            sendData.status = 'allow';
            sendData.severity = 'low';
            sendData.loginstatus = 'login_succeeded';
            sendData.device = {};
            sendData.request = Reqdata;
            sendData.message = "Login Request successfully reached.";
        }else{
            Login.sendLoginData("login_failed",Reqdata);
            var sendData = {};
            sendData.status = 'allow';
            sendData.severity = 'low';
            sendData.loginstatus = 'login_failed';
            sendData.device = {};
            sendData.request = Reqdata;
            sendData.message = "Login Request successfully reached.";
        }
        return res.status(200).send(sendData);
}
    catch (err) 
    {
        //console.error(err.message);
        retMsg = {};
        retMsg.status = 500;
        retMsg.message = err.message;
        return res.status(200).send(retMsg);
    }
}

Login.sendLoginData = async(status,data) => {
    try 
    {
        // key = Buffer.from("4147198233139327:w7Oh4BBuW53aPlgH").toString('base64');
        // key = Buffer.from("9985673163189735:w7Oh4BBuW53aPlgH:ios").toString('base64');
        // console.log(key);
        // const headers = {
        //     'Content-Type': 'application/json',
        //     'Authorization': data.auth_key,
        //     "package":  data.package,
        //     "token" : data.request_token,
        //     };
        // console.log(headers);
        const body = {
            "ev": status,
            "uID": data.uID,
            "dID" : data.request_token,
            "package" : data.package,
            "uex": {
            "email": data.email,
            "username": data.username
            }
        }

        axios
        .post('https://mdev.authsafe.ai/v1/login',
        // .post('http://127.0.0.1:8000/v1/login', 
        body,
        // { headers: headers }
        )
        .then(res => {
            console.log(`statusCode: ${res.status}`);
            console.log(res);
        })
        .catch(error => {
            console.error(error);
            // console.log("error");
        });
    } 
    catch (err) 
    {
        console.error(err.message);
    
    }
};

module.exports = Login;