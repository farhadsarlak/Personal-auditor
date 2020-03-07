
process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');
const express= require('express');
const _ = require('lodash');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const persianDate = require('persian-date');

const {authenticate} = require('./middleware/authenticate');
const {User} = require('./model/user');
const {splitDate,printRunLevel} = require('./utils/utils');
const {logger} = require('./utils/winston');

printRunLevel(config.get('level'));

const app = express();
const requestLogger = fs.createWriteStream(path.join(__dirname,'log/requests.log'));


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

app.post('/api/payments',authenticate,async (req,res)=>{
      try{
            const body = _.pick(req.body,['info','amount']);
            let user = await User.findOneAndUpdate({
                  _id: req.user._id
            },{
                  $push:{
                        payments:{
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
});

app.get('/api/payments',authenticate,async (req,res)=>{
      try{
            let user = await User.findOne({
                  _id:req.user._id
            })
            if(!user){
                  return res.status(404).json({
                        Error: 'کاربر یافت نشد'
                  })
            }
            res.status(200).send(user.payments)


      }catch (e){
            res.status(400).json({
                  Error:`خطایی رخ داده است. ${e}`
            })
      }
});

app.delete('/api/payments/:id',authenticate, async (req, res)=>{
      let id = req.params.id;

      try{
            let user = await User.findOneAndUpdate({
                  _id: req.user._id,
                  'payments._id':id
            },{
                  $pull:{
                        payments:{
                              _id:id
                        }
                  }
            });
            if(!user){
                  return res.status(404).json({
                        Error: 'کاربر یافت نشد'
                  })
            }
            res.status(200).send(user.payments)

      }catch (e){
            res.status(400).json({
                  Error:`خطایی رخ داده است. ${e}`
            })
      }
});

app.patch('/api/payments/',authenticate,async (req,res)=>{
      let body = _.pick (req.body,['id','info','amount','date']);

      try{
            let user = await User.findOneAndUpdate({
                  _id : req.user._id,
                  'payments._id': body.id
            },{
                  $set:{
                        'payments.$.info': body.info,
                        'payments.$.amount': body.amount,
                        'payments.$.date': body.date,
                        
                  }
            });

            if(!user){
                  return res.status(404).json({
                        Error: 'کاربر یافت نشد'
                  })
            }
            res.status(200).json({
                  Message:'هزینه آپدیت شد'
            })

            
      }catch (e){
            res.status(400).json({
                  Error:`خطایی رخ داده است. ${e}`
            })
      }
})


app.get('/api/paymentSum', authenticate, async (req, res) => {
    let amount = [];
    let theDate;

    try {
        let user = await User.findOne({
            _id: req.user._id
        });

        if (!user) {
            return res.status(404).json({
                Error: 'User not found'
            });
        }

        user.payments.forEach((element) => {
            splitArr = splitDate(element.date);
            theDate = new persianDate([Number(splitArr[0]), Number(splitArr[1]), Number(splitArr[2])]);
            todayDate = new persianDate();

            if (theDate.isSameMonth(todayDate)) {
                amount.push(element.amount);
            }
        });

        res.status(200).json({
            Sum: `${_.sum(amount)}`
        });
    } catch (e) {
        res.status(400).json({
            Error: `Something went wrong. ${e}`
        });
    }
});

app.get('/api/payment/:date',authenticate, async (req, res)=>{
      let param = req.params.date;
      let date = param.replaceAll('-','/');

      try {
            let user = await User.findOne({
                  _id: req.user._id
            });

            let payments=[];

            if (!user) {
                  return res.status(404).json({
                  Error: 'User not found'
                  });
            }

            user.payments.forEach((el)=>{
                  if ( el.date === date ){
                        payments.push(el);
                  }
            });

            res.status(200).send(payments);

      }catch (e){
            res.status(400).json({
            Error: `Something went wrong. ${e}`
        }); 
      }
});


app.listen(config.get('PORT'),() => {
      logger.log({
            level: 'info',
            message:`Server is running on port ${config.get('PORT')}`
      });
});