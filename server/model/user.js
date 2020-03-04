const validator = require('validator');
const {mongoose} = require('./../db/mongoose.js');

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
      }
});

let User= mongoose.model('User',userSchema);

module.exports = {
      User
}