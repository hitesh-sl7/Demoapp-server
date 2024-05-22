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
                let userId = row.user_id;
                let score = (row.correct / (row.correct + row.incorrect + row.skip)) * 100;
                let time = parseInt(row.time.replace("m", ""));
        
                if (!lb.hasOwnProperty(userId)) {
                    lb[userId] = {
                        'score': [score],
                        'time': time
                    };
                } else {
                    lb[userId]['score'].push(score);
                    lb[userId]['time'] += time;
                }
        
                var u = await sql`SELECT * FROM game_users WHERE id = ${userId}`;
                if (u.rowCount) {
                    let uObj = u.rows[0];
                    lb[userId]['username'] = uObj.username;
                    lb[userId]['email'] = uObj.email;
                    lb[userId]['user_id'] = uObj.id;
                }
            }

            for (let userId in lb) {
                if (lb.hasOwnProperty(userId)) {
                    let scores = lb[userId]['score'];
                    let totalScore = scores.reduce((acc, score) => acc + score, 0);
                    let averageScore = totalScore / scores.length;
                    let highestScore = Math.max(...scores);
        
                    lb[userId]['avg_score'] = parseFloat(averageScore.toFixed(2));
                    lb[userId]['high_score'] = parseFloat(highestScore.toFixed(2));

                    delete lb[userId]['score'];
                }
            }
        }



        console.log(lb);

        lb = Object.values(lb);
        lb.sort((a, b) => {
            // Sort by high_score answers (descending)
            if (a.high_score !== b.high_score) {
                return b.high_score - a.high_score;
            } else {
                // If high_score answers are equal, sort by time (descending)
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