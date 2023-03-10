const express = require("express");
const useragent = require('express-useragent');
const { v4: uuidv4 } = require('uuid');
var cookieParser = require('cookie-parser');

const app = express();


// app.use((req, res, next) => {
//     res.header('Access-control-Allow-Origin', req.headers.origin);
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     res.header('Access-Control-Allow-Credentials', true);
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//         return res.status(200).json({});
//     }
//     next();
// });


app.use(express.json()); // req.body
app.use(useragent.express());

app.use("/login", require("./routes/login"));

app.use("/register", require("./routes/register"));

app.use("/reset-password", require("./routes/reset"));

const PORT = process.env.PORT || 6000;

app.listen(PORT, process.env.bindIP, () => {
    console.log("Server is running on port " + PORT);
});