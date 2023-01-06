const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function jwtGenerator(user_id) {
    const payload = {
        user_id: user_id
    }
    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "16hr" })
};


// function jwtVerify(token){
//     jwt.verify(token,process.env.jwtSecret,function(err,data){
//         if (err){
//             res.sendStatus(403);
//         }else{
//             res.json({
//                 text : "passed"
//             })
//         }
//     })
// }


module.exports = jwtGenerator;
