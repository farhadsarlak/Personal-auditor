const validator = require('validator');
const {mongoose} = require('./../db/mongoose.js');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config= require('config')

const tokenOptions= {type: String,require:true}

let userSchema = new mongoose.Schema({
      fullname:{
            type:String,
            required:true,
            minLength:3,
            trim: true
      },
      email:{
            type: String,
            required:true,
            unique: true,
            minLength:6,
            trim: true,
            validate:{
                  validator: validator.isEmail,
                  message: '{Value} معتبر نیست، لطفا ایمیل معتبر وارد نمایید'
            }
      },
      password:{
            type:String,
            minLength:6,
            required:true
      },
      tokens:[{
            _id: false,
            access:tokenOptions,
            token:tokenOptions
      }],
      payments: [{
            info:{
                  type:String,
                  required: true,
                  trim:true
            },
            amount:{
                  type:Number,
                  required:true
            },
            date:{
                  type:String,
                  required:true
            }
      }],
      receive:[{
            info:{
                  type:String,
                  required: true,
                  trim:true
            },
            amount:{
                  type:Number,
                  required:true
            },
            date:{
                  type:String,
                  required:true
            }
      }]
});

userSchema.methods.toJSON= function(){
      let user= this;
      let userObject = user.toObject();

      return _.pick(userObject,['_id','fullname','email']);
}

userSchema.statics.findByCredentials = function (email, password) {
    let User = this;

    return User.findOne({
        email
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password,user.password,(err,res)=>{
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}
userSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';

    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, config.get('JWT_SECRET')).toString();

    user.tokens.push({
        access,
        token
    });

    return user.save().then(() => {
        return token;
    });
}

userSchema.statics.findByToken = function(token) {

      let user = this;
      let decoded;
      try{
            decoded= jwt.verify(token, config.get('JWT_SECRET'));
      }catch(e){
            return Promise.reject();
      }

      return user.findOne({
            _id: decoded._id,
            'tokens.token': token,
            'tokens.access':'auth'
      })
}


userSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

let User= mongoose.model('User',userSchema);

module.exports = {
      User
}