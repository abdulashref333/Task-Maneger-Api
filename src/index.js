require('dotenv').config();
const express = require('express');
const task = require('./routers/task')
const user = require('./routers/user');
const app = express();
require('./db/mongoose');
const path = require('path');
const publicDirectory = path.join(__dirname,'../public');
const port = process.env.PORT;


const errorHand = (error,req,res,next) => {
    res.status(400).send({error:error.message});
};


app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(user);
app.use(task);
app.use(errorHand);

app.listen(port,()=>{console.log('Server is up on port '+port)});