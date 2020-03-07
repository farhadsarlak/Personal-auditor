
process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');
const express= require('express');
const _ = require('lodash');
const morgan = require('morgan');
const helmet = require('helmet');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const persianDate = require('persian-date');

const {authenticate} = require('./middleware/authenticate');
const {User} = require('./model/user');

console.log(`*** LEVEL:${String(config.get('level'))} ***`);

const app = express();
const requestLogger = fs.createWriteStream(path.join(__dirname,'log/requests.log'));
const logger = winston.createLogger({
      transports: [
            new winston.transports.Console(),
            new winston.transports.File({filename: path.join(__dirname,'log/server-status.log')})
      ]
})

persianDate.toLocale('en');
const date =new persianDate().format('YYYY/M/DD');


app.use(express.json());
app.use(helmet());
app.use(morgan('combined', {stream: requestLogger}));

app.post('/api/users',async (req,res)=>{
      try{
            const body = _.pick(req.body,['fullname','email','password']);

            let user= new User(body);

            await user.save();
            res.status(200).send(user);
      }catch (e){
            res.status(400).json({
                  Error: `خطایی رخ داده است ${err}`
            })
      }
});

app.post('/api/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);

        let user = await User.findByCredentials(body.email, body.password);
        let token = await user.generateAuthToken();
        res.header('x-auth', token)
            .status(200)
            .send(token);
    } catch (e) {
        res.status(400).json({
            Error: `خطایی رخ داده است! ${e}`
        });
    }
});

app.post('/api/payment',authenticate,async (req,res)=>{
      try{
            const body = _.pick(req.body,['info','amount']);
            let user = await User.findOneAndUpdate({
                  _id: req.user._id
            },{
                  $push:{
                        payment:{
                              info:body.info,
                              amount:body.amount,
                              date
                        }
                  }
            });
            if(!user){
                  return res.status(404).json({
                        Error: 'کاربر یافت نشد'
                  })
            }
            res.status(200).json({
                  Message:'هزینه ذخیره شد'
            })

      }catch(e){
            res.status(400).json({
                  Error:`خطایی رخ داده است ${e}`
            })
      }
})

app.listen(config.get('PORT'),() => {
      logger.log({
            level: 'info',
            message:`Server is running on port ${config.get('PORT')}`
      });
});