const express = require('express');
const User = require('../models/users');
const auth = require('../middleware/auth');
const Router = new express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const publicDirectory = path.join(__dirname,'../../public/');
const multer = require('multer');
const sharp = require('sharp');


Router.post('/users',async(req,res)=>{
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        age:req.body.age
    });
    try{
        const token = await user.genrateToken();
        res.send({user,token});
    }catch(e){
        res.status(400).send(e.message);
    }
});

Router.post('/users/login',async (req,res)=>{
    try{
        // console.log(req.body)
        const user = await User.findOne({email:req.body.email});
        if(!user) return res.status(400).send('email or password is invalid');
        
        const isValidPass = await bcrypt.compare(req.body.password,user.password);
        if(!isValidPass) return res.status(400).send('email or password is invalid');
        
        const token = await user.genrateToken();
        // res.sendFile(publicDirectory+'home/home.html'); //it should be dynamic file
        res.send({user,token});
    } catch(e){
        res.status(500).send(e.message);
    }
});
Router.post('/users/logout',auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token ;
        });
        await req.user.save() ;
        // res.sendFile(publicDirectory+'home/home.html');
        res.send(); // we could send back the login page.
    } catch(e){
        res.status(500).send();
    }
});
Router.post('/users/logoutAll',auth, async (req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        // res.sendFile(publicDirectory+'login.html');
        res.send('you are loged out from all your devices');
    } catch(e){
        res.status(500).send(e.message);
    }
});

// Get users 

Router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user);
});

// update users

Router.patch('/users/me',auth, async (req,res) =>{
    const updates = Object.keys(req.body);
    const allowed = ['name','age','email','password'];
    const isValideUpdate = updates.every(item => allowed.includes(item));
    if(!isValideUpdate) {
        return res.status(400).send('invalide Updates!');
    }
    try{  
        updates.forEach(item => {
            req.user[item] = req.body[item];
        });
        
        await req.user.save();
        res.send(req.user);
    }catch(e){
        // this is bad request because you are sending not valide data .
        res.status(400).send(e.message);
    }
});

Router.delete('/users/me',auth, async (req,res) =>{
    try{
        await req.user.remove();
        res.send(req.user);
    } catch(e) {
        res.status(400).send(e.message);
    }
});
const uplode = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter (req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/i)){
            return cb(new Error('Please upload only jpg or png images'));
        }
        cb(undefined,true);
    }
});
Router.post('/users/me/avatar',auth, uplode.single('avatar'), async (req,res) => {
    req.user.avatar= await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
    await req.user.save();
    res.send('You are successfuly upload your avatar.');
});
Router.delete('/users/me/avatar',auth, async(req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});
Router.get('/users/:id/avatar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error('404 Not found')
        }
        
        res.set('content-type','image/jpg');
        res.send(user.avatar);
    } catch(e) {
        res.status(404).send({error:e.message})
    }
})

module.exports = Router;