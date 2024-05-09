const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const sqlite3 = require('sqlite3');


var leaderboard = function(){
};
leaderboard.getLeaderboard = async (req, res) => {
    try{
        var Reqdata = req.body;
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        const game = req.query.game;
        var sendData = {};

        const db = new sqlite3.Database('../game_database.db');
   
        const getQuizProfile = () => {
            return new Promise((resolve, reject) => {
                db.all("SELECT user_id,correct,incorrect,skip,time FROM quiz_record ", function(err, row) {
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

        var lb = {};
        for (const element of quiz_rows) {
            if (!lb.hasOwnProperty(element['user_id'])) {
                lb[element['user_id']] = {
                    'correct' : element['correct'],
                    'incorrect' : element['incorrect'],
                    'skip' : element['skip'],
                    'time' : parseInt(element['time'].replace("m",""))
                }
            }else{
                lb[element['user_id']]['correct'] += element['correct'];
                lb[element['user_id']]['incorrect'] += element['incorrect'];
                lb[element['user_id']]['skip'] += element['skip'];
                lb[element['user_id']]['time'] += parseInt(element['time'].replace("m",""));
            }

            const getUser = () => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT id, username, email, phone, password FROM users WHERE id=?", [element['user_id']], function(err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
            };
            const rows = await getUser();
            lb[element['user_id']]['username'] = rows[0].username;
            lb[element['user_id']]['email'] = rows[0].email;
            lb[element['user_id']]['user_id'] = rows[0].id;
        };

        lb = Object.values(lb);
        lb.sort((a, b) => {
            // Sort by correct answers (descending)
            if (a.correct !== b.correct) {
                return b.correct - a.correct;
            } else {
                // If correct answers are equal, sort by time (descending)
                return a.time - b.time;
            }
        });

        if(lb){
            sendData.status = 'success';
            sendData.leaderboard = lb;
            // sendData.request = Reqdata;
            sendData.message = "Leaderboard Request successfully reached.";
        }else{
            sendData.tatus = 'failed';
            sendData.request = Reqdata;
            sendData.message = "leaderboard Request successfully reached.";
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

module.exports = leaderboard;