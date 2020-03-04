
process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');
const express= require('express');
const _ = require('lodash');

const {User} = require('./model/user');

console.log(`*** LEVEL:${String(config.get('level'))} ***`);

const app = express();
app.use(express.json());

app.post('/api/users',(req,res)=>{
      const body = _.pick(req.body,['fullname','email','password']);
      console.log(body)
      let user= new User(body);

      user.save().then((user)=>{
            res.status(200).send(user);

      },err => res.status(400).json({
            Error: `خطایی رخ داده است ${err}`
      }))
});

app.listen(config.get('PORT'),() => {
      console.log(`Server is running on port ${config.get('PORT')}`);
});