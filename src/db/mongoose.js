const mongoose = require('mongoose');

mongoose.connect(process.env.HOST,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:false
})
    .then(()=>console.log('connection successed'))
    .catch(()=>console.log('connection falid'));

// const me = new User({
//     name:'Abdel-Rahman ashraf',
//     email:"abdo.ahsref@gmail.com",
//     age:22,
//     password:" Abdo01 00100  "
// });

// me.save().then((me)=>console.log(me)).catch((er)=>console.log(er.errors));


// const task = new Task({
//     description:"   send project to hossame    ",
//     completed:true
// });

// task.save()
//     .then(()=>console.log(task))
//     .catch((er)=>console.log(er));