require('dotenv').config();
const jwt = require('jsonwebtoken');


//function for authenticating our token 
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']//checking for token in the header
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null)
    {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN,(err,response)=>{//matching token with our token 
        if(err){
            return res.sendStatus(403);
        }
        res.locals = response;
        next()
    })
}

module.exports = {authenticationTOken: authenticateToken}