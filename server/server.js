
process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');

const {User} = require('./model/user');

console.log(`*** LEVEL:${String(config.get('level'))} ***`);


let newUser= new User({
      fullname:' فرهاد سرلک',
      email:'farhad.sarlak64@gmail.com',
      password:'1234567'
});

newUser.save().then((user)=>{
      console.log("کاربر ایجاد شد",user);
})
