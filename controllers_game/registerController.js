const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const path = require('path')

const axios = require('axios');
const sqlite3 = require('sqlite3');

const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'ASIAYS6CACM4UJU6G4JO',
    secretAccessKey: 'HmuutcwjuM5+D2y8JfzPAIpa0YJg7EewGTSFN7j4',
    region: 'ap-south-1'
  });

const dynamodb = new AWS.DynamoDB();

var Register = function(){
    
};
Register.postRegister = async (req, res) => {
    let buffer;
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

        // try {
        //     const response = await s3.getObject({
        //       Bucket: 'cyclic-lime-stormy-panda-ap-south-1',
        //       Key: 'game_database.db'
        //     }).promise();
        //     buffer = response.Body;
        // } catch (error) {
        // console.error('Error accessing database file from S3:', error);
        // }

        // const db = new sqlite3.Database(buffer);
        // const registerUser = () => {
        //     return new Promise((resolve, reject) => {
        //         db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT,password TEXT,email TEXT UNIQUE,phone TEXT)");

        //         db.run("INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)", [Reqdata.rfs.name, Reqdata.rfs.password, Reqdata.rfs.email, Reqdata.rfs.phone], function(err) {
        //             if (err) {
        //                 reject(err); 
        //             } else {
        //                 resolve(this.lastID);
        //             }
        //         });
        //     });
        // };

        // Define the parameters for creating the table
        const params = {
            TableName: 'users',
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' } // Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'N' }, // Numeric (INTEGER) attribute
                { AttributeName: 'username', AttributeType: 'S' }, // String (TEXT) attribute
                { AttributeName: 'password', AttributeType: 'S' }, // String (TEXT) attribute
                { AttributeName: 'email', AttributeType: 'S' }, // String (TEXT) attribute
                { AttributeName: 'phone', AttributeType: 'S' } // String (TEXT) attribute
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5, // Adjust as needed
                WriteCapacityUnits: 5 // Adjust as needed
            },
            // Optional: Define secondary indexes, etc.
        };

        // Create the table
        dynamodb.createTable(params, (err, data) => {
            if (err) {
                console.error("Error creating table:", err);
            } else {
                console.log("Table created successfully:", data);
            }
        });

        const item = {
            id: { N: '1' }, // Assuming id is auto-incremented in your database
            username: { S: Reqdata.rfs.name },
            password: { S: Reqdata.rfs.password },
            email: { S: Reqdata.rfs.email },
            phone: { S: Reqdata.rfs.phone }
        };
        
        // Set up parameters for putting the item
        const itemParams = {
            TableName: 'users',
            Item: item
        };
        
        // Insert the item into the table
        dynamodb.putItem(itemParams, (err, data) => {
            if (err) {
                console.error("Error inserting item:", err);
            } else {
                console.log("Item inserted successfully:", data);
            }
        });

        try {
            // const lastInsertedId = await registerUser();
            // const serializedBuffer = Buffer.from(db.serialize(), 'utf-8');
            // await uploadDatabaseToS3(serializedBuffer);
            var sendData = {};
            sendData.loginstatus = 'register_succeeded';
            sendData.message = "Register Request successfully reached.";
            // console.log(`User inserted with ID: ${lastInsertedId}`);
        } catch (error) {
            console.log(error);
            var sendData = {};
            sendData.loginstatus = 'register_failed';
            sendData.request = Reqdata;
            sendData.message = "Email already Exists!";
        }

        // db.close((err) => {
        //     if (err) {
        //         return console.error(err.message);
        //     }
        //     console.log('Close the database connection.');
        // });

        // var respData = await Register.sendRegisterData("register_succeeded",Reqdata);
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

        var auth_key = '';
        var plt = '';
        var token = '';
        var domain = 'https://mdev.sensfrx.ai/v1/register';

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

        const body = {
            "ev": status,
            // "dID": "eyJwdGwiOiJIZWxsbywgd29ybGQhIiwiZXYiOiJtX2wiLCJldCI6IjIwMjItMDktMDZUMTE6MTQ6MTcuMzI2WiIsImNzIjoiVVRGLTgiLCJzciI6IjE1MzZ4ODY0IiwidnAiOiIxNTM2eDcxNCIsImNkIjoyNCwidHoiOi01LjUsImhjIjo4LCJtdCI6WyJhcHBsaWNhdGlvbi9wZGYiLCJ0ZXh0L3BkZiJdLCJwIjpbIlBERiBWaWV3ZXIiLCJDaHJvbWUgUERGIFZpZXdlciIsIkNocm9taXVtIFBERiBWaWV3ZXIiLCJNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyIiwiV2ViS2l0IGJ1aWx0LWluIFBERiJdLCJ0byI6IjIwMjItMDktMDZUMTE6MTM6MTguNDc0WiIsInBvIjoiaHR0cHM6Ly9kZW1vLWF1dGhzYWZlLmhlcm9rdWFwcC5jb20vcmVnaXN0ZXIucGhwIiwicmYiOiJodHRwczovL2RlbW8tYXV0aHNhZmUuaGVyb2t1YXBwLmNvbS9sb2dpbi5waHAiLCJwcyI6MywiYm4iOiJOZXRzY2FwZSIsImJsIjoiZW4tVVMiLCJqZSI6MCwibGUiOiJtX3MiLCJkbSI6OCwid2QiOjAsIndnbHYiOiJHb29nbGUgSW5jLiAoSW50ZWwpIiwid2dsciI6IkFOR0xFIChJbnRlbCwgSW50ZWwoUikgSXJpcyhSKSBYZSBHcmFwaGljcyBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKSIsInRlIjpmYWxzZSwibXRwIjowLCJjZSI6MSwiYXgiOiJBY3RpdmVYIE9iamVjdCBub3Qgc3VwcG9ydGVkIiwicGFsIjpbXSwicG0iOjAsIl9fYXN0ayI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqZFNJNk1UTXlMQ0p3Y2lJNk1qUXhMQ0p6WlhOelgybGtJam9pT1RabFptVXlObVV0WVRFMU5DMDBOekk0TFdJMk1UZ3RaVFEzT0RZek1EQmhOR013SWl3aWFXRjBJam94TmpZeU5EWXhOamc1TENKbGVIQWlPakUyTmpJMU1Ua3lPRGw5LjRvaUk5V3ZhMU9zbmRMWlMxMmg2emliVnBEQnBWNnluZWFCUFlrZUM4dmsiLCJ2c2kiOiI5NmVmZTI2ZS1hMTU0LTQ3MjgtYjYxOC1lNDc4NjMwMGE0YzAiLCJ2ZGkiOiIxM2I4MTQ3My1kOGMzLTRmNTctOWIzMC1hODVkODI3NzViYjQiLCJhc2RpIjoiNmQ2NTQwIiwiYXNiaSI6ImIyZGUyOSIsImFzc2kiOiJlZDA0Yjc5YS0yZGNjLTExZWQtYjU4OS0wMDBjMjlhNWNkOGMiLCJtX20iOjI4LCJzX3UiOjAsInNfZCI6MCwieCI6ODQxLCJ5Ijo0OTUsInN0IjowLCJ2IjowLCJlbCI6ImJ1dHRvbiIsImVsSUQiOiJsb2dpbi1idXR0b24iLCJjbCI6e319",
            "dID" : data.request_token,
            "df" : data.d_f,
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

const uploadDatabaseToS3 = async (buffer) => {
    try {
      await s3.upload({
        Bucket: 'cyclic-lime-stormy-panda-ap-south-1',
        Key: 'game_database.db',
        Body: buffer
      }).promise();
  
      console.log('Serialized database buffer uploaded to S3 successfully');
    } catch (error) {
      console.error('Error uploading serialized database buffer to S3:', error);
    }
  };


module.exports = Register;