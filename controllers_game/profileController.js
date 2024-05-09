const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const sqlite3 = require('sqlite3');


var profile = function(){
};
profile.getProfile = async (req, res) => {
    try{
        var Reqdata = req.body;
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        const user_id = req.query.user_id;
        var sendData = {};

        const db = new sqlite3.Database('./game_database.db');
        const getUser = () => {
            return new Promise((resolve, reject) => {
                db.all("SELECT id, username, email, phone, password FROM users WHERE id=?", [user_id], function(err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        };
        const rows = await getUser();

        const getQuizProfile = () => {
            return new Promise((resolve, reject) => {
                db.all("SELECT correct,incorrect,skip,time FROM quiz_record WHERE user_id=?", [user_id], function(err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        };
        const quiz_rows = await getQuizProfile();
        console.log(quiz_rows);

        var game_info = {
            "quiz" : { 
                "game_played" : 0,
                "correct" : 0,
                "incorrect" : 0,
                "skip" : 0,
                "time" : "0m" }
        };

        quiz_rows.forEach((element) => {
            game_info['quiz']['game_played'] += 1;
            game_info['quiz']['correct'] += element['correct'];
            game_info['quiz']['incorrect'] += element['incorrect'];
            game_info['quiz']['skip'] += element['skip'];
            var t_time = game_info['quiz']['time'];
            t_time = parseInt(t_time.replace("m",""));
            t_time = parseInt(element['time'].replace("m","")) + t_time;
            game_info['quiz']['time'] = t_time.toString() + "m";

        });

        if(rows.length > 0){
            sendData.status = 'success';
            sendData.user_info = {
                "uID" : rows[0].id,
                "username" : rows[0].username,
                "phone" : rows[0].phone,
                "email" : rows[0].email,
            }
            sendData.game_info = game_info;
            // sendData.request = Reqdata;
            sendData.message = "Profile Request successfully reached.";
        }else{
            sendData.tatus = 'failed';
            sendData.request = Reqdata;
            sendData.message = "Profile Request successfully reached.";
        }

        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            //console.log('Close the database connection.');
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

module.exports = profile;