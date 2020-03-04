
process.env.NODE_CONFIG_DIR = __dirname + '/config';

const config = require('config');

console.log(`*** LEVEL:${String(config.get('level'))} ***`);
console.log(`DB_PATH: ${config.get('MONGOURI')}`);
console.log(`PROT: ${config.get('PORT')}`);