const _ = require('lodash');

String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
}

let splitDate = (date) => {
    return _.split(date, '/');
}

let printRunLevel = (level) => {
    console.log(`*** ${String(level).toUpperCase()} ***`);
};

let handleUserValidate = (user,res)=>{
    if(!user){
    return res.status(404).json({
        Error: 'کاربر یافت نشد'
        })
    }
}

let handleMessage=(res,message) =>{
    res.status(200).json({
    Message:`${message}`
    })
}

let handleError =(res,e) =>{
    res.status(400).json({
    Error:`خطایی رخ داده است ${e}`
    })
}

module.exports = {
    splitDate,
    printRunLevel,
    handleError,
    handleMessage,
    handleUserValidate
};