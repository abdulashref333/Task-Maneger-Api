const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    }
},{
    timestamps:true
});
taskSchema.methods.toJSON = function (){
    const taskObject = this.toObject();
    // delete taskObject.owner;
    // delete taskObject._id;
    return taskObject;
}
const Task = mongoose.model('Task',taskSchema)
module.exports = Task;