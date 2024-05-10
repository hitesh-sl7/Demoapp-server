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
                "correct" : 0,
                "incorrect" : 0,
                "skip" : 0,
                "time" : "0m" }
        };

        let dusers = dynamodb.collection('users');
        dusers.scan().then((items) => {
            const deletePromises = items.map((item) => dusers.deleteItem(item.id));
            return Promise.all(deletePromises);
          }).then(() => {
            console.log("All items in 'dusers' collection deleted successfully.");
          }).catch((err) => {
            console.error("Error deleting items from collection:", err);
          });

        let dquizes = dynamodb.collection('quiz_record');
        dquizes.scan().then((items) => {
            const deletePromises = items.map((item) => dquizes.deleteItem(item.id));
            return Promise.all(deletePromises);
          }).then(() => {
            console.log("All items in 'dquizes' collection deleted successfully.");
          }).catch((err) => {
            console.error("Error deleting items from collection:", err);
          });

        return true;

        let users = dynamodb.collection('users');
        var all_users = await users.list();
        all_users.results.forEach((row) => {
            var u = users.get(row.key);
            if(u.props.id == user_id){
                user_info = {
                    "uID" : user_id,
                    "username" : u.props.username,
                    "phone" : u.props.phone,
                    "email" : u.props.email,
                }
            }
        });

        let quizes = dynamodb.collection('quiz_record');
        var all_quizes = await quizes.list();

        all_quizes.results.forEach((row) => {
            var q = quizes.get(row.key);
            game_info['quiz']['game_played'] += 1;
            game_info['quiz']['correct'] += q.props.correct;
            game_info['quiz']['incorrect'] += q.props.incorrect;
            game_info['quiz']['skip'] += q.props.skip;
            var t_time = game_info['quiz']['time'];
            t_time = parseInt(t_time.replace("m",""));
            t_time = parseInt(q.props.time.replace("m","")) + t_time;
            game_info['quiz']['time'] = t_time.toString() + "m";
        });

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