const {Router} = require('express')
const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs') // npm //Використовується щодо шифрування паролю.

//request - ті данні, які прийшли. response - то данні, що відсилаємо.

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

router.post('/registration', async (request, response) => { 

    try{

        const { email, name, rpassword, confirm } = request.body; //request.body - отримує дані з форм.
                                                                 //request.params - отримує данні з адресного рядка.
        const candidate = await UserModel.findOne({ email })
        //console.log(request.body) //В body ми отримуюємо name'и форми, яку ми відправляємо
        if(candidate)
        {
            request.flash('regError', 'Such user already exists')
            return response.redirect('/auth/login#register');
        }
        else
        {   
            const hash_password = await bcrypt.hash(rpassword, 10) //Другий параметр приймає значення, яке буде означати складність шифрування (Рекомендовано 10-12). Також це може бути стрічка.
            const user = new UserModel({ userName:name, password: hash_password, email, cartData: { items: [] } })
            await user.save();
            response.redirect('/auth/login#login')
        }


    } catch(error) {
        console.error(error)
    }

})

router.get('/logout', (request, response) => {
    //request.session.isAuthenticated = false;
    //Альтернатива
    //console.log(request.body)
    request.session.destroy(() => response.redirect('/auth/login'));
});

module.exports = router;