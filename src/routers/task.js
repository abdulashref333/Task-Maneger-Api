const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');
const Router = new express.Router();

Router.post('/tasks',auth, async(req,res)=>{
    try{
        const task = new Task({
            ...req.body,
            owner:req.user._id
        });
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e.message);
    }
});

Router.get('/tasks',auth, async (req,res) =>{
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed==='true';
    }

    try{
        // console.log(req.user);
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }
        }).execPopulate();
        // const tasks = await Task.find({owner:req.user._id});
        // if(!tasks) return res.status(404).send();
        res.send(req.user.tasks);
    }catch(e){
        res.status(404).send(e.message);
    }
});

Router.get('/tasks/:id',auth, async (req,res) => {
    try{
        const _id = req.params.id;
        const task = await Task.findOne({_id, owner:req.user._id});
        const user = await task.populate('owner').execPopulate();

        if(!task)   return res.status(404).send('No Task Was found!');
        
        res.send(task);
    }catch(e){
        res.status(500).send(e.message);
    }    
});

Router.patch('/tasks/:id',auth, async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowed = ['description','completed'];
    const isValideUpdate = updates.every(item => allowed.includes(item));
    
    if(!isValideUpdate) {
        return res.status(400).send('invalide Update!');
    }

    try{
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id});
        if(!task)  return res.status(404).send("NO Task Was founded !");
        
        updates.forEach(item => task[item] = req.body[item] );
        
        await task.save();
        res.send(task);
    
    } catch (e) {
        res.status(400).send(e.message);
    }
});
Router.delete('/tasks/:id',auth, async(req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
        
        if(!task) return res.status(404).send('no task was found!');
        
        res.send(task);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

module.exports = Router;