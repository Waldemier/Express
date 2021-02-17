const {body} = require('express-validator/check') //body -> Перевірка body параметрів на валідність
const UserModel = require('../models/userModel')
const CONFIGURE_VALUES = require('../configuration/configurationKeys')

//Масив валідаторів, застусовуваних при реєстрації
exports.registrationValidators =  [

    body('email').isEmail()
    .withMessage('Invalid email address')
    .trim()
    .custom(async (value) => {

            try {

                const user = await UserModel.findOne({ email: value })
                if(user) {
                    return new Promise((resolve, reject) => reject('User with this email already exists')); //Повертаємо проміс, оскільки функція є асинхронною
                    //Альтернатива:
                    //return Promise.reject('User with this email already exists');
                }
                return true

            } catch(e)
            {
                console.error(e)
            }

    })
    .normalizeEmail(), //Приводить емайл до валідного, нормалізованого стану (Доприкладу, коли використовується uppercase в назві, переводить до lowercase'у)

    body('name', 'Name must be a minimum 3 symbols').isLength({ min: 3 }).trim(), //trim() забирає зайві пробіли напочатку та вкінці

    body('rpassword', 'Password must be a minimum of 5 characters and a maximum of 21')
    .isLength({min: CONFIGURE_VALUES.MIN_PASS_SYMBOLS, max: CONFIGURE_VALUES.MAX_PASS_SYMBOLS})
    .isAlphanumeric().trim(),

    body('confirm', 'Passwords must be equals')
    .isLength({min: CONFIGURE_VALUES.MIN_PASS_SYMBOLS, max: CONFIGURE_VALUES.MAX_PASS_SYMBOLS})
    .custom((value, {req}) => { //value == confirm; Якщо потрібно доступитись до методу request, то другим параметром прописуємо {req}, завдаки їй тепер допустимі різні властивості методу request (EX: req.body.password)
            if(value === req.body.rpassword)
            {
                return true;
            }
            throw new Error() // Можна використовувати false, як аналогію.
    })
    .trim()

]

exports.coursesValidators = [
    body('title').isLength({ min: 3, max: 120}).withMessage('Course title must be at least 3 chapters').trim(),
    body('price').isNumeric().withMessage('The price field should contain only numbers'),
    body('url').isURL().withMessage('Image url is not valid')
]