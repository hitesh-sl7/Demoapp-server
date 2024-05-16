const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const { sql } = require("@vercel/postgres");

var leaderboard = function(){
};
leaderboard.getLeaderboard = async (req, res) => {
    let buffer;
    try{
        var Reqdata = req.body;
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        const game = req.query.game;
        var sendData = {};

        var lb = {};

        var q = await sql`SELECT * from quiz_record;`;
        if(q.rowCount){
            for (let row of q.rows) {
                if (!lb.hasOwnProperty(row.user_id)) {
                    lb[row.user_id] = {
                        'correct' : row.correct,
                        'incorrect' : row.incorrect,
                        'skip' : row.skip,
                        'time' : parseInt(row.time.replace("m",""))
                    }
                }else{
                    lb[row.user_id]['correct'] += row.correct;
                    lb[row.user_id]['incorrect'] += row.incorrect;
                    lb[row.user_id]['skip'] += row.skip;
                    lb[row.user_id]['time'] += parseInt(row.time.replace("m",""));
                }

                var u = await sql`SELECT * from game_users where id=${row.user_id}`;
                if(u.rowCount){
                    uObj = u.rows[0];
                    lb[row.user_id]['username'] = uObj.username;
                    lb[row.user_id]['email'] = uObj.email;
                    lb[row.user_id]['user_id'] = uObj.id;
                    }
            };
        }

        console.log(lb);

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