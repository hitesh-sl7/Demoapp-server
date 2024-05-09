const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const sqlite3 = require('sqlite3');
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

var Login = function(){
};
Login.postLogin = async (req, res) => {
    try{
        var Reqdata = req.body;
        var dID = new Buffer.from(Reqdata.request_token.split(".")[1], 'base64').toString();
        dID = JSON.parse(dID);
        pid = dID['pr'];
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        var sendData = {};

        await uploadDatabaseToS3();

        try {
            const response = await s3.getObject({
              Bucket: 'cyclic-lime-stormy-panda-ap-south-1',
              Key: 'game_database.db'
            }).promise();
            const buffer = response.Body;
          } catch (error) {
            console.error('Error accessing database file from S3:', error);
          }

          const db = new sqlite3.Database(buffer);

        const findUser = () => {
            return new Promise((resolve, reject) => {
                db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT,password TEXT,email TEXT UNIQUE,phone TEXT)");

                db.all("SELECT id, username, email, phone, password FROM users WHERE email=? and password=?", [Reqdata.email, Reqdata.password], function(err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        };
        
        const rows = await findUser();
        console.log(rows)
        if(rows.length > 0){
            sendData.loginstatus = 'login_succeeded';
            sendData.user_info = {
                "uID" : rows[0].id,
                "username" : rows[0].username,
                "phone" : rows[0].phone,
                "email" : rows[0].email,
            }
            // sendData.request = Reqdata;
            sendData.message = "Login Request successfully reached.";
        }else{
            sendData.loginstatus = 'login_failed';
            sendData.request = Reqdata;
            sendData.message = "Login Request successfully reached.";
        }

        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });

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

const uploadDatabaseToS3 = async () => {
    try {
      // Get the updated database file as a buffer
      const buffer = await new Promise((resolve, reject) => {

          fs.readFile('./game_database.db', (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
 
      });
  
      // Upload the updated database file to S3
      await s3.upload({
        Bucket: 'cyclic-lime-stormy-panda-ap-south-1',
        Key: 'game_database.db',
        Body: buffer
      }).promise();
  
      console.log('Updated database file uploaded to S3 successfully');
    } catch (error) {
      console.error('Error uploading updated database file to S3:', error);
    }
  };


module.exports = Login;