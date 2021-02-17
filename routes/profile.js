const {Router} = require('express')
const UserModel = require('../models/userModel')
const protectionMiddleware = require('../middleware/routeProtection')
const router = Router();

/*
    Хронологія подій (як відбувається завантаження, робота мідлвеєра, завантаження в папку та вивід на екран):
    1. Завантаження картинки та відправка форми.
    2. Задається для всього проекту статина папка images, щоб ми мали доступ до її контенту.
    3. Відпрацювання мідлвеєру в index.js, в якому вказується де файл буде збережений, з якою (можливо оновленою) назвою та між якими розширеннями буде відфільтрований. 
    Якщо пройшов всі етапи - експортується назад, що створює для request нове поле file.
    4. Викликається роутер з методом post, де проводяться зміни полів моделі відповідно до тих змін які прийшли з форми. Після чого оновлений юзер зберігається назад в бд.
    5. Оновлення (редирект) сторінки.S
*/

router.get('/', protectionMiddleware, (request, response) => {
    response.render('profile', { title: 'Profile', isProfile: true, user: request.userCreatedTest.toObject() })
});

router.post('/', protectionMiddleware, async (request, response) => {
    try {

        const user = await UserModel.findById(request.userCreatedTest._id);

        const toChange = {
            userName: request.body.name
        }

        if(request.file) //поле file доступне завдяки підключеному middleware'у в index.js
        {
            console.log(request.file)
            toChange.avatarProfileUrl = request.file.path;
        }
        
        Object.assign(user, toChange) //Добавлення деяких змін до моделі user
        await user.save();
        response.redirect('/profile');

    } catch(e) {
        console.error(e);
    }
    
})

module.exports = router;