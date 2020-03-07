const mongoose= require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;
mongoose.connect(config.get('MONGOURI'),
            {
                  useNewUrlParser: true,
                  useUnifiedTopology: true,
                  useCreateIndex: true,
                  useFindAndModify:false
            });

module.exports = {
      mongoose
}