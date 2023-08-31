const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const AWS = require("aws-sdk");

const axios = require('axios');
var fs = require("fs");
const s3 = new AWS.S3()

var Register = function(){
    
};
Register.registerLog = async (req, res) => {
    try{
        var Reqdata = req.body;
        console.log(Reqdata);
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.ip = requestIp.getClientIp(req);
        if((Reqdata.rfs.name == "") || (Reqdata.rfs.email == "") || (Reqdata.rfs.password == "") ){
            Register.sendRegisterData("register_failed",Reqdata);
            var sendData = {};
            sendData.status = 'allow';
            sendData.severity = 'low';
            sendData.register_status = 'register_failed';
            sendData.device = {};
            sendData.request = req.body;
            sendData.message = "Register Request successfully reached";
            return res.status(200).send(sendData);  
        }
        // var data = Reqdata.rfs.name + ";" + Reqdata.rfs.email + ":" + Reqdata.rfs.password + "\n";
        // console.log(data);

        let my_file = await s3.getObject({
            Bucket: "cyclic-lime-stormy-panda-ap-south-1",
            Key: "some_files/users.json",
        }).promise()

        var users = new Buffer.from(my_file['Body']).toString();
        users = JSON.parse(users)

        if(users[Reqdata.rfs.email]){
            Register.sendRegisterData("register_failed",Reqdata);
            var sendData = {};
            sendData.status = 'allow';
            sendData.severity = 'low';
            sendData.register_status = 'register_failed';
            sendData.device = {};
            sendData.request = req.body;
            sendData.message = "Register Request successfully reached. User Already exists";
            return res.status(200).send(sendData);  
        }else{
            userid = Object.keys(users).length + 1
            // userid = 1
            users[Reqdata.rfs.email] = {"id" : 50 + userid , "username" : Reqdata.rfs.name , "password" : Reqdata.rfs.password , "phone" : Reqdata.rfs.phone  }

            await s3.putObject({
                Body: JSON.stringify(users),
                Bucket: "cyclic-lime-stormy-panda-ap-south-1",
                Key: "some_files/users.json",
            }).promise()
        }

        
        // fs.appendFile("users.txt", data, (err) => {
        // if (err) console.log(err);
        // console.log("Successfully Written to File.");
        // });
        Register.sendRegisterData("register_succeeded",Reqdata);
        var sendData = {};
        sendData.status = 'allow';
        sendData.severity = 'low';
        sendData.register_status = 'register_succeeded';
        sendData.device = {};
        sendData.request = req.body;
        sendData.message = "Register Request successfully reached.";
        return res.status(200).send(sendData);
        }catch (err) 
        {
            //console.error(err.message);
            retMsg = {};
            retMsg.status = 500;
            retMsg.message = err.message;
            return res.status(200).send(retMsg);
        }
    }

    Register.sendRegisterData = async(status,data) => {
        try 
        {

            // 9153477437238592
        // key = Buffer.from("9153477437238592:w7Oh4BBuW53aPlgH").toString('base64');
        // const headers = {
        //     'Content-Type': 'application/json',
        //     'Authorization': data.auth_key,
        //     "package":  data.package
        //     };
        const body = {
            "ev": status,
            // "dID": "eyJwdGwiOiJIZWxsbywgd29ybGQhIiwiZXYiOiJtX2wiLCJldCI6IjIwMjItMDktMDZUMTE6MTQ6MTcuMzI2WiIsImNzIjoiVVRGLTgiLCJzciI6IjE1MzZ4ODY0IiwidnAiOiIxNTM2eDcxNCIsImNkIjoyNCwidHoiOi01LjUsImhjIjo4LCJtdCI6WyJhcHBsaWNhdGlvbi9wZGYiLCJ0ZXh0L3BkZiJdLCJwIjpbIlBERiBWaWV3ZXIiLCJDaHJvbWUgUERGIFZpZXdlciIsIkNocm9taXVtIFBERiBWaWV3ZXIiLCJNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyIiwiV2ViS2l0IGJ1aWx0LWluIFBERiJdLCJ0byI6IjIwMjItMDktMDZUMTE6MTM6MTguNDc0WiIsInBvIjoiaHR0cHM6Ly9kZW1vLWF1dGhzYWZlLmhlcm9rdWFwcC5jb20vcmVnaXN0ZXIucGhwIiwicmYiOiJodHRwczovL2RlbW8tYXV0aHNhZmUuaGVyb2t1YXBwLmNvbS9sb2dpbi5waHAiLCJwcyI6MywiYm4iOiJOZXRzY2FwZSIsImJsIjoiZW4tVVMiLCJqZSI6MCwibGUiOiJtX3MiLCJkbSI6OCwid2QiOjAsIndnbHYiOiJHb29nbGUgSW5jLiAoSW50ZWwpIiwid2dsciI6IkFOR0xFIChJbnRlbCwgSW50ZWwoUikgSXJpcyhSKSBYZSBHcmFwaGljcyBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKSIsInRlIjpmYWxzZSwibXRwIjowLCJjZSI6MSwiYXgiOiJBY3RpdmVYIE9iamVjdCBub3Qgc3VwcG9ydGVkIiwicGFsIjpbXSwicG0iOjAsIl9fYXN0ayI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqZFNJNk1UTXlMQ0p3Y2lJNk1qUXhMQ0p6WlhOelgybGtJam9pT1RabFptVXlObVV0WVRFMU5DMDBOekk0TFdJMk1UZ3RaVFEzT0RZek1EQmhOR013SWl3aWFXRjBJam94TmpZeU5EWXhOamc1TENKbGVIQWlPakUyTmpJMU1Ua3lPRGw5LjRvaUk5V3ZhMU9zbmRMWlMxMmg2emliVnBEQnBWNnluZWFCUFlrZUM4dmsiLCJ2c2kiOiI5NmVmZTI2ZS1hMTU0LTQ3MjgtYjYxOC1lNDc4NjMwMGE0YzAiLCJ2ZGkiOiIxM2I4MTQ3My1kOGMzLTRmNTctOWIzMC1hODVkODI3NzViYjQiLCJhc2RpIjoiNmQ2NTQwIiwiYXNiaSI6ImIyZGUyOSIsImFzc2kiOiJlZDA0Yjc5YS0yZGNjLTExZWQtYjU4OS0wMDBjMjlhNWNkOGMiLCJtX20iOjI4LCJzX3UiOjAsInNfZCI6MCwieCI6ODQxLCJ5Ijo0OTUsInN0IjowLCJ2IjowLCJlbCI6ImJ1dHRvbiIsImVsSUQiOiJsb2dpbi1idXR0b24iLCJjbCI6e319",
            "dID" : data.request_token,
            "package" : data.package,
            "rfs": {
            "email": data.email,
            "name": data.name,
            "phone": data.phone,
            "password": data.password
            }
        }

        axios
        .post('https://mdev.authsafe.ai/v1/register', 
        body,
        // { headers: headers }
        )
        .then(res => {
            console.log(`statusCode: ${res.status}`);
            console.log(res);
        })
        .catch(error => {
            console.error(error);
        });

    } 
    catch (err) 
    {
        //console.error(err.message);
        retMsg = {};
        retMsg.status = 500;
        retMsg.message = err.message;
        return res.status(200).send(retMsg);
    }
};




module.exports = Register;