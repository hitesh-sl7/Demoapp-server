
function EnsureToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'indefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }

}