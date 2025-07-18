const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const AWS = require("aws-sdk");

const axios = require('axios');
var fs = require("fs");
const s3 = new AWS.S3()


const { sql } = require("@vercel/postgres");

var Register = function(){
    
};
Register.registerLog = async (req, res) => {
    try{
        var Reqdata = req.body;
        console.log(Reqdata);
        var dID = new Buffer.from(Reqdata.request_token.split(".")[1], 'base64').toString();
        dID = JSON.parse(dID);
        pid = dID['pr'];
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.ip = requestIp.getClientIp(req);
        if((Reqdata.rfs.name == "") || (Reqdata.rfs.email == "") || (Reqdata.rfs.password == "" || Reqdata.rfs.phone == "0" ) ){
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


        try {
            var u  = await sql`SELECT * from users where email=${Reqdata.rfs.email}`;
            if(u.rowCount){
                var sendData = {};
                sendData.loginstatus = 'register_failed';
                sendData.request = Reqdata;
                sendData.message = "Email already exists!";
                return res.status(200).send(sendData);
            }else{
                await sql`INSERT INTO users (email, username, phone, password) VALUES (${Reqdata.rfs.email},${Reqdata.rfs.name},${Reqdata.rfs.phone},${Reqdata.rfs.password})`;
                var respData = await Register.sendRegisterData("register_succeeded",Reqdata);
                var sendData = {};
                sendData.status = respData.status;
                sendData.severity = respData.severity;
                sendData.loginstatus = 'register_succeeded';
                sendData.device = respData.device;
                sendData.request = Reqdata;
                sendData.message = "Register Request successfully reached.";
                return res.status(200).send(sendData);
            }
        } catch (error) {
            console.log(error);
            var sendData = {};
            sendData.loginstatus = 'register_failed';
            sendData.request = Reqdata;
            sendData.message = error;
        }
        
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

        var auth_key = '';
        var plt = '';
        var token = '';
        if(data.plt == "android"){
            var domain = 'https://mdev.sensfrx.ai/v1/register/android';
        }else{
            var domain = 'https://mdev.sensfrx.ai/v1/register/ios';
        }
        

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
        }else if(pid == "862" || pid == 862){
            token = "6291856998352997:6GXgaUaU4LBep0ka:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "1101" || pid == 1101){
            token = "5663953452149639:aK3eMhWFhGTRmAFC";
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "720" || pid == 720){
            token = "5916688855237721:IzfVF8xbpNsn1zcP:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "722" || pid == 722){
            token = "7838156638213257:CsFqXOfLIhc274J7:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "1060" || pid == 1060){
            token = "8194711154633931:cvWOYxTvAGapT3vX";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "1068" || pid == 1068){
            token = "5486677226778972:dZPeRk6TdE4RflYa";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "1070" || pid == 1070){
            token = "2116762679626643:gMI3vPBtamoqX7JS";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "1073" || pid == 1073){
            token = "1492623774869734:amkT9V3XLGgRBZe2";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "1074" || pid == 1074){
            token = "5898688517546524:066LHfKodyrw6SS7";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://m.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://m.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "873" || pid == 873){
            token = "7837597548861916:65tfs1r6Xps0xcod:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
            domain = 'https://sandboxmdev.sensfrx.ai/v1/register';
        }else if(pid == "1144" || pid == 1144){
            token = "7396577689746895:Zx9OURZLBMWS3WXf";
            auth_key = new Buffer.from(token).toString('base64');
            if(data.plt == "android"){
                domain = 'https://sandboxmdev.sensfrx.ai/v1/register/android';
            }else{
                domain = 'https://sandboxmdev.sensfrx.ai/v1/register/ios';
            }
        }else if(pid == "965" || pid == 965){
            token = "2522779579888945:VD2R7QHHpmBpihLU:" + plt;
            auth_key = new Buffer.from(token).toString('base64');
        }else if(pid == "1121" || pid == 1121){
            token = "1953822545692768:5errgeszaObfdkOm";
            auth_key = new Buffer.from(token).toString('base64');
        }

        const headers = {
            'Content-Type': 'application/json',
            'authorization': auth_key,
            "package":  data.package,
            };

        const body = {
            "ev": status,
            // "dID": "eyJwdGwiOiJIZWxsbywgd29ybGQhIiwiZXYiOiJtX2wiLCJldCI6IjIwMjItMDktMDZUMTE6MTQ6MTcuMzI2WiIsImNzIjoiVVRGLTgiLCJzciI6IjE1MzZ4ODY0IiwidnAiOiIxNTM2eDcxNCIsImNkIjoyNCwidHoiOi01LjUsImhjIjo4LCJtdCI6WyJhcHBsaWNhdGlvbi9wZGYiLCJ0ZXh0L3BkZiJdLCJwIjpbIlBERiBWaWV3ZXIiLCJDaHJvbWUgUERGIFZpZXdlciIsIkNocm9taXVtIFBERiBWaWV3ZXIiLCJNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyIiwiV2ViS2l0IGJ1aWx0LWluIFBERiJdLCJ0byI6IjIwMjItMDktMDZUMTE6MTM6MTguNDc0WiIsInBvIjoiaHR0cHM6Ly9kZW1vLWF1dGhzYWZlLmhlcm9rdWFwcC5jb20vcmVnaXN0ZXIucGhwIiwicmYiOiJodHRwczovL2RlbW8tYXV0aHNhZmUuaGVyb2t1YXBwLmNvbS9sb2dpbi5waHAiLCJwcyI6MywiYm4iOiJOZXRzY2FwZSIsImJsIjoiZW4tVVMiLCJqZSI6MCwibGUiOiJtX3MiLCJkbSI6OCwid2QiOjAsIndnbHYiOiJHb29nbGUgSW5jLiAoSW50ZWwpIiwid2dsciI6IkFOR0xFIChJbnRlbCwgSW50ZWwoUikgSXJpcyhSKSBYZSBHcmFwaGljcyBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKSIsInRlIjpmYWxzZSwibXRwIjowLCJjZSI6MSwiYXgiOiJBY3RpdmVYIE9iamVjdCBub3Qgc3VwcG9ydGVkIiwicGFsIjpbXSwicG0iOjAsIl9fYXN0ayI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqZFNJNk1UTXlMQ0p3Y2lJNk1qUXhMQ0p6WlhOelgybGtJam9pT1RabFptVXlObVV0WVRFMU5DMDBOekk0TFdJMk1UZ3RaVFEzT0RZek1EQmhOR013SWl3aWFXRjBJam94TmpZeU5EWXhOamc1TENKbGVIQWlPakUyTmpJMU1Ua3lPRGw5LjRvaUk5V3ZhMU9zbmRMWlMxMmg2emliVnBEQnBWNnluZWFCUFlrZUM4dmsiLCJ2c2kiOiI5NmVmZTI2ZS1hMTU0LTQ3MjgtYjYxOC1lNDc4NjMwMGE0YzAiLCJ2ZGkiOiIxM2I4MTQ3My1kOGMzLTRmNTctOWIzMC1hODVkODI3NzViYjQiLCJhc2RpIjoiNmQ2NTQwIiwiYXNiaSI6ImIyZGUyOSIsImFzc2kiOiJlZDA0Yjc5YS0yZGNjLTExZWQtYjU4OS0wMDBjMjlhNWNkOGMiLCJtX20iOjI4LCJzX3UiOjAsInNfZCI6MCwieCI6ODQxLCJ5Ijo0OTUsInN0IjowLCJ2IjowLCJlbCI6ImJ1dHRvbiIsImVsSUQiOiJsb2dpbi1idXR0b24iLCJjbCI6e319",
            "dID" : data.request_token,
            "d_f" : data.d_f,
            "package" : data.package,
            "rfs": {
            "uID" : data.rfs.uID,
            "email": data.rfs.email,
            "name": data.rfs.name,
            "phone": data.rfs.phone,
            "password": data.rfs.password
            }
        }
        const response = await axios.post(domain,body,{ headers: headers });
        console.log(`statusCode: ${response.status}`);
        console.log(response.data);
        return response.data


    } 
    catch (err) 
    {
        console.error(err.message);
        retMsg = {};
        retMsg.status = 500;
        retMsg.message = err.message;
        return res.status(200).send(retMsg);
    }
};




module.exports = Register;