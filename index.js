const express = require("express");
const useragent = require('express-useragent');
const { v4: uuidv4 } = require('uuid');
var cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const forge = require('node-forge');

const app = express();


app.use(express.json()); 
app.use(useragent.express());


app.use("/login", require("./routes/login"));

app.use("/register", require("./routes/register"));

app.use("/webhook", require("./routes/webhook"));

app.use("/reset-password", require("./routes/reset"));

// Urls for game server

app.use("/game/login", require("./routes_game/login"));

app.use("/game/register", require("./routes_game/register"));

app.use("/game/quiz", require("./routes_game/questions"));

app.use("/game/get-profile", require("./routes_game/profile"));

app.use("/game/get-leaderboard", require("./routes_game/leaderboard"));



const PORT = process.env.PORT || 6000;

app.listen(PORT, process.env.bindIP, () => {
    console.log("Server is running on port " + PORT);
});