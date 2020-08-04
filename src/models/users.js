const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('age must be positive number!');
            }
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        validate (value){
            if(!validator.isEmail(value)){
                throw new Error('invalid Email!');
            }
        },
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        trim:true,
        validate (value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password shouldn\'t contain \"password\"');
            }
        }
    },
    avatar:Buffer,
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true,
    toJSON: { virtuals: true }
});
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
});

userSchema.methods.toJSON = function (){
    const userObj = this.toObject();
    delete userObj.tokens;
    delete userObj.password;
    delete userObj.avatar;
    return userObj;
}

userSchema.methods.genrateToken = async function(){
    const token = await jwt.sign({"id":this._id.toString()},process.env.JWT_SCERET_KEY);
    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
}

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8);
    }
    next();
});
userSchema.pre('remove', async function (next) {
    const user = this ;
    await Task.deleteMany({owner:user._id});
    next();
})
const User = mongoose.model('User',userSchema);
module.exports = User;