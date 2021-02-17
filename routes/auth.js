const {Router} = require('express')
const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs') // npm //Використовується щодо шифрування паролю.
const nodemailer = require('nodemailer') //npm
const mailOptions = require('../email/registrationMailConfig')
const crypto = require('crypto') //Встроєний пакет
const resetMailOptions = require('../email/resetPasswordMailConfig')

const { validationResult } = require('express-validator/check') //Імпорт властивості, яка відповідає за збереження та вивід помилок невдалих валідувань
const { registrationValidators } = require('../utils/validators')

//request - ті данні, які прийшли. response - то данні, що відсилаємо.
//body - ті данні, які прийшли з форм через вказані властивості value. params - ті данні, які прийшли з url стрічки.

const router = Router();

router.get('/login', (request, response) => {
    response.render('../views/auth/login', { title: 'Authentication page', isLogin: true, loginError: request.flash('loginError'), registrationError: request.flash('regError') });
});

//PS. Одне з завдань сесії - зберігати конкретного юзера, при вході в систему. Та видалення його з сесії при виході з системи.                                                                                                                                                                               
router.post('/login', async (request, response) => {

    //request.session.isAuthenticated = true;
    //================Legacy====================
    //console.log(request.body)
    //const user = await UserModel.findById('600b01b22c32485408a987ae')
    //console.log(user)
    //request.session.userCreatedTest = user;
    //====================================
    try
    {
        const { email, password } = request.body;
        const checkUser = await UserModel.findOne({ email });

        if(checkUser)
        {
            
            //Перевірка на те, чи пароль в зашифрованому вигляді співпадає з парооем, який ми ввели при логіні в магазин.
            const hash_password_check = await bcrypt.compare(password, checkUser.password); //true/false 
            //console.log(hash_password_check)

            if(hash_password_check)
            {
                request.session.isAuthenticated = true;
                request.session.userCreatedTest = checkUser;
                request.session.save(error => { if(error) throw error; response.redirect('/courses'); });
            }
            else
            {
                request.flash('loginError', 'Wrong password')
                return response.redirect('/auth/login#login') //Можна без ретурну проводити редірект (у цьому випадку я його використав на всякий випадок, щоб завершити можливі інші процеси)
            }
        }
        else
        {
            request.flash('loginError', 'Such user does not exist')
            return response.redirect('/auth/login#login') //Можна без ретурну проводити редірект (у цьому випадку я його використав на всякий випадок, щоб завершити можливі інші процеси)
        }

    }catch(e)
    {
        console.error(e);
    }
    
});


//Перший спосіб (Сервіс імітації емейлу) https://ethereal.email/

// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: { 
//         user: 'lou.block@ethereal.email',
//         pass: 'JfB8sddjycQjggT7Jg'
//     }
// });

//Другий спосіб через gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: 'server.node.developer@gmail.com',
        pass: 'nodelova1402'
    }
});


router.post('/registration', registrationValidators,  async (request, response) => { 

    try {

        const errors = validationResult(request); //Перевірка request параметрів на успішно пройдену попередню валідність

        if(!errors.isEmpty())
        {
            request.flash('regError', errors.array()[0].msg)
            return response.status(422).redirect('/auth/login#register') //status(422) - вказує на те, що у нас були помилки з валідуванням даних. (Необов, але для покращення зрозумілості відповіді сервера в хедерах браузера)
        }

        const { email, name, rpassword, confirm } = request.body; //request.body - отримує дані з форм.
                                                                 //request.params - отримує данні з адресного рядка.

        //console.log(request.body) //В body ми отримуюємо name'и форми, яку ми відправляємо

        const hash_password = await bcrypt.hash(rpassword, 10) //Другий параметр приймає значення, яке буде означати складність шифрування (Рекомендовано 10-12). Також це може бути стрічка.
        const user = new UserModel({ userName:name, password: hash_password, email, cartData: { items: [] } })
        await user.save();


        transporter.sendMail(mailOptions(email), error => { if(error) console.error(error) })

        response.redirect('/auth/login#login')


    } catch(error) {
        console.error(error)
    }

})

router.get('/reset', (request,response) => {
    response.render('./auth/reset', { error: request.flash('error') })
})

router.post('/reset', (request,response) => {

    try {

        //Використали пакет crypto для створення тимчасового токену (збережений у буфері, який потрібно інтерпретувати у String)
        crypto.randomBytes(32, async (error, buffer) =>
        {
            if(error){ request.flash('error', 'Something happened, try again in a few minutes'); return response.redirect('/auth/reset'); }

            const token = buffer.toString('hex'); //Буфер - це згенерований ключ, який ми переводимо з буферезованого стану в стрічковий.

            const user = await UserModel.findOne({email: request.body.email});

            if(user) {

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; //Час життя токену (Добавляємо годину життя до поточної години - за цей час пароль повинен бути змінений)
                //console.log(Date.now())
                //console.log(user.resetTokenExpiration)
                await user.save();
                //В даному випадку await не потрібен, все залежить від сервісу який використовується для відправки емейлів (можуть бути сервіси, такі як SendGrid, чий пакет повертає проміс)
                await transporter.sendMail(resetMailOptions(user.email, token), error => { if(error) console.log(error) });
                response.redirect('/auth/login#login')

            }
            else {
                request.flash('error', 'There is no such email');
                response.redirect('/auth/reset');
            }

        })
    } catch(e) {

        console.log(e);

    }
})

router.get('/newpassword/:token', async(request, response) => {

    if(!request.params.token)
    {
        request.flash('error', 'Some happend with token')
        return response.redirect('/auth/login')
    }

    try {

        const user = await UserModel.findOne({ resetToken: request.params.token, resetTokenExpiration: {$gt: Date.now()}}) //Умова, де $gt (greater) then Date.now()

        if(!user)
        {
            return response.redirect('/auth/login#login')
        }
        else {
            response.render('./auth/passwordChange', { error: request.flash('error'), userId: user._id.toString(), token: request.params.token })
        }

    } catch(e) {

        console.error(e);

    }
    

    
})

router.post('/newpassword', async(request, response) => {

    try
    {
        // console.log(request.body.token)
        // console.log(request.body.userId)
        // console.log(request.body.password)
        const user = await UserModel.findOne({_id: request.body.userId, resetToken: request.body.token, resetTokenExpiration: {$gt: Date.now()}}); //{$gt: Date.now()} - Умова, де перевіряється час життя токену, який має бути більший за поточний час, 
                                                                                                                                                       //в іншому разі виходить що час життя токену вичерпано і пароль ми змінити не зможемо.                                                                                                                           
        if(user)
        {

            const hashPassword = await bcrypt.hash(request.body.password, 10);
            user.password = hashPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;

            await user.save();
            
            response.redirect('/auth/login');

        }
        else
        {   
            request.flash('loginError', 'Token life is over, try changing your password later');
            response.redirect('/auth/login');
        }
    }
    catch(e)
    {
        console.error(e)
    }
})

router.get('/logout', (request, response) => {
    //request.session.isAuthenticated = false;
    //Альтернатива
    //console.log(request.body)
    request.session.destroy(() => response.redirect('/auth/login'));
});

module.exports = router;