const parser = require("ua-parser-js");
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const jwtGenerator = require("../utils/jwtGenerator");
const axios = require('axios');
var fs = require("fs");
const forge = require('node-forge');
const path = require('path')
const fsPromises = require('fs/promises');
const sqlite3 = require('sqlite3');

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
        
        // console.log(quesArray);
        const db = new sqlite3.Database('game_database.db');
        const quizEntry = () => {
            return new Promise((resolve, reject) => {
                db.run("CREATE TABLE IF NOT EXISTS quiz_record (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER,quiz_id TEXT,ques_indexes TEXT,correct NUMBER,incorrect NUMBER,skip NUMBER, time TEXT)");
                db.run("INSERT INTO quiz_record (user_id, quiz_id, ques_indexes) VALUES (?, ?, ?)", [user_id, quiz_id, indexes.join()], function(err) {
                    if (err) {
                        reject(err); 
                    } else {
                        resolve(this.lastID);
                    }
                });
            });
        };
        try {
            const lastInsertedId = await quizEntry();
        } catch (error) {
            console.log(error);
        }

        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });

        var sendData = {};
        sendData.quiz_id = quiz_id;
        sendData.questions = quesArray;
        // sendData.options = q['options'];
        // sendData.answer = q['options'][q['correctOptionIndex']];
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
        console.log(Reqdata)

        const db = new sqlite3.Database('game_database.db');
        const quizEntry = () => {
            return new Promise((resolve, reject) => {
                db.run("UPDATE quiz_record SET correct=?, incorrect=?, skip=?, time=? WHERE quiz_id=?", 
                    [Reqdata.correct, Reqdata.incorrect, Reqdata.skip, Reqdata.time, Reqdata.quiz_id], 
                    function(err) {
                        if (err) {
                            reject(err); 
                        } else if (this.changes === 0) {
                            reject(new Error("Quiz ID does not exist"));
                        } else {
                            resolve();
                        }
                    }
                );
            });
        };

        try {
            await quizEntry();
            var sendData = {};
            sendData.status = "success";
            sendData.message = "Quiz answer saved successfully";
        } catch (error) {
            console.log(error);
            var sendData = {};
            sendData.status = "failed";
            sendData.message = error.message;
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