const express = require("express");
const useragent = require('express-useragent');
const { v4: uuidv4 } = require('uuid');
var cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const forge = require('node-forge');

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

const handleSecureConnection = (tlsSocket) => {
    tlsSocket.on('secureConnection', () => {
      console.log('Secure connection established');
      
      // Access the raw client hello and server hello packets
      const clientHello = tlsSocket.getPeerCertificate().clientHello;
      const serverHello = tlsSocket.server.getHello();
      
      console.log('Client Hello Packet:', clientHello);
      console.log('Server Hello Packet:', serverHello);
    });
  };


app.use(express.json()); // req.body
app.use(useragent.express());


app.use("/login", require("./routes/login"));

app.use("/register", require("./routes/register"));

app.use("/webhook", require("./routes/webhook"));

app.use("/reset-password", require("./routes/reset"));



const options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./certificate.crt'),
  };

  const server = https.createServer(options, (req, res) => {
    app(req, res);
  });

// Attach the secure connection event handler
server.on('secureConnection', handleSecureConnection);

const PORT = process.env.PORT || 6000;

app.listen(PORT, process.env.bindIP, () => {
    console.log("Server is running on port " + PORT);
});