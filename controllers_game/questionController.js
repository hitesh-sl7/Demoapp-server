const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
//const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
const forge = require('node-forge');
const path = require('path')
const fsPromises = require('fs/promises');

const { sql } = require("@vercel/postgres");

var Questions = function(){
};
Questions.getQues = async (req, res) => {
    try{
        const filePath = path.resolve(__dirname, '../kbc_questions.json')
        try {
            const data = await fsPromises.readFile(filePath);
            var ques = JSON.parse(data);
        } catch (err){
            console.log(err);
        }
        // console.log(ques);
        const user_id = req.query.user_id;
        const quiz_id = generateRandomString(10);
        var quesArray = [];
        var indexes = [];

        console.log(user_id);

        for (let i = 0; i < 10; i++) {
            var randomIndex = getRandomindex(ques);
            q = ques[randomIndex];
            quesArray.push(q);
            indexes.push(randomIndex);
        }

        try {
            await sql`INSERT INTO quiz_record (user_id, quiz_id, ques_indexes, correct, incorrect, skip, time) VALUES (${user_id},${quiz_id},${indexes.join()},0,0,0,'')`;

        } catch (error) {
            console.log(error);
        }


        var sendData = {};
        sendData.quiz_id = quiz_id;
        sendData.questions = quesArray;
        sendData.message = "Question Request successfully reached.";
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

Questions.postQues = async (req, res) => {
    try{
        var Reqdata = req.body;
        console.log(Reqdata);

        if(Reqdata.correct == 0 & Reqdata.incorrect == 0 & Reqdata.skip == 0){
            var sendData = {};
            sendData.status = "failed";
            sendData.message = "invalid data";
            return res.status(200).send(sendData);
        }

        try {

            var q = await sql`SELECT * from quiz_record where quiz_id=${Reqdata.quiz_id}`;
            if(q.rowCount){
                try {
                    await sql`UPDATE quiz_record set correct=${Reqdata.correct},incorrect=${Reqdata.incorrect},skip=${Reqdata.skip},time=${Reqdata.time} WHERE quiz_id=${Reqdata.quiz_id};`;
        
                } catch (error) {
                    console.log(error);
                }
                var sendData = {};
                sendData.status = "success";
                sendData.message = "Quiz answer saved successfully";
            }else{
                var sendData = {};
                sendData.status = "failed";
                sendData.message = "Quiz id not found";
            }
        } catch (error) {
            console.log(error);
            var sendData = {};
            sendData.status = "failed";
            sendData.message = error.message;
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

function getRandomindex(ques) {
    const randomIndex = Math.floor(Math.random() * ques.length);
    return randomIndex
  }

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = Questions;