const jwt = require('jsonwebtoken');
const User = require('../models/users');

const auth = async (req,res,next)=>{
    try{
        const token = req.header("Authorization").replace('Bearer ','');
        const userId =await jwt.verify(token,process.env.JWT_SCERET_KEY);
        const user = await User.findOne({_id:userId.id , 'tokens.token':token});
        if(!user) return res.status(400).send('Authanticat First');
        req.token = token ;
        req.user = user;
        next();
    } catch(e) {
        res.status(401).send(e.message);
    }
}

module.exports = auth;