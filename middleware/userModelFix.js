const UserModel = require('../models/userModel')


//Сесія зберігає лише данні, а не модель. Тому є проблеми з популейтом, які вирішує цей мідлвейр.
//PS. Популейт може використовуватись лише по відношенню до моделі бд, а не до любих даних.

module.exports = async function(request, response, next){

    if(!request.session.userCreatedTest)
    {
        return next();
    }

    request.userCreatedTest = await UserModel.findById(request.session.userCreatedTest._id);
    //console.log(request.userCreatedTest)
    next();
}