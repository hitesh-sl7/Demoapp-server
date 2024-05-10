const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const CyclicDB = require('@cyclic.sh/dynamodb');
const dynamodb = CyclicDB('lime-stormy-pandaCyclicDB');

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

        let quizes = dynamodb.collection('quiz_record');
        var all_quizes = await quizes.list();

        var lb = {};
        for (const element of all_quizes.results) {
            var q = await quizes.get(element.key);
            if (!lb.hasOwnProperty(q.props.user_id)) {
                lb[q.props.user_id] = {
                    'correct' : q.props.correct,
                    'incorrect' : q.props.incorrect,
                    'skip' : q.props.skip,
                    'time' : parseInt(q.props.time.replace("m",""))
                }
            }else{
                lb[q.props.user_id]['correct'] += q.props.correct;
                lb[q.props.user_id]['incorrect'] += q.props.incorrect;
                lb[q.props.user_id]['skip'] += q.props.skip;
                lb[q.props.user_id]['time'] += parseInt(q.props.time.replace("m",""));
            }

            let users = dynamodb.collection('users');
            var all_users = await users.list();

            for (const row of all_users.results) {
                var u = await users.get(row.key);
                if(u.props.user_id == q.props.user_id){
                    lb[q.props.user_id]['username'] = u.props.username;
                    lb[q.props.user_id]['email'] = u.props.email;
                    lb[q.props.user_id]['user_id'] = u.props.id;
                }
            };   
        };

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