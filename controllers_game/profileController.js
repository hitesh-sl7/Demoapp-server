const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')

const { sql } = require("@vercel/postgres");


var profile = function(){
};
profile.getProfile = async (req, res) => {
    let buffer;
    try{
        var Reqdata = req.body;
        // Reqdata.auth_key = req.headers['authorization'];
        // Reqdata.package = req.headers['package'];
        Reqdata.uID = '';
        Reqdata.ip = requestIp.getClientIp(req);
        const user_id = req.query.user_id;
        var sendData = {};
        var user_info = {};
        var game_info = {
            "quiz" : { 
                "game_played" : 0,
                "avg_score" : 0,
                "high_score" : 0,
                // "correct" : 0,
                // "incorrect" : 0,
                // "skip" : 0,
                "time" : "0m" }
        };

        var u = await sql`SELECT * from game_users where id=${user_id}`;
        if(u.rowCount){
            uObj = u.rows[0];
            user_info = {
                            "uID" : user_id,
                            "username" : uObj.username,
                            "phone" : uObj.phone,
                            "email" : uObj.email,
                        }
            }
        
        var q = await sql`SELECT * from quiz_record where user_id=${user_id}`;
        var scores = [];
        if(q.rowCount){
            for (let row of q.rows) {
                    game_info['quiz']['game_played'] += 1;
                    scores.push((row.correct/(row.correct+row.incorrect+row.skip))*100);
                    // game_info['quiz']['correct'] += row.correct;
                    // game_info['quiz']['incorrect'] += row.incorrect;
                    // game_info['quiz']['skip'] += row.skip;
                    var t_time = game_info['quiz']['time'];
                    t_time = parseInt(t_time.replace("m",""));
                    t_time = parseInt(row.time.replace("m","")) + t_time;
                    game_info['quiz']['time'] = t_time.toString() + "m";
                };
            }
        
            console.log(scores);

        var totalScore = scores.reduce((acc, score) => acc + score, 0);
        var averageScore = totalScore / scores.length;
        var highestScore = Math.max(...scores);

        game_info['quiz']['avg_score'] = parseFloat(averageScore.toFixed(2));
        game_info['quiz']['high_score'] = parseFloat(highestScore.toFixed(2));
        
        
        console.log(user_info);
        console.log(game_info);

        if(user_info && game_info){
            sendData.status = 'success';
            sendData.user_info = user_info;
            sendData.game_info = game_info;
            // sendData.request = Reqdata;
            sendData.message = "Profile Request successfully reached.";
        }else{
            sendData.tatus = 'failed';
            sendData.request = Reqdata;
            sendData.message = "Profile Request successfully reached.";
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

module.exports = profile;