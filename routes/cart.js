const {Router} = require('express');
//const CartModel = require('../models/cartModel')
const CourseModel = require('../models/courseModel')

const router = Router();

router.post('/add', async (require, response) => {
    //const course = await CourseModel.getCourseById(require.body.id);
    //await CartModel.add(course);
    const course = await CourseModel.findById(require.body.id);
    await require.userCreatedTest.addToCart(course);
    response.redirect('/cart') //PS.* Переводить на файл cart.hbs в якому генерується відповідна сторінка для вікна браузеру.
})


router.delete('/remove/:id', async (request, response) => {
    //const cart = await CartModel.remove(require.params.id); //params тому, що id у нас в адресній стрічці

    await request.userCreatedTest.removeFromCart(request.params.id);
    //Головне завдання популейта - розкривати данні (в нашому випадку ми розкриваємо данні курсу по ключу, який зберігається в моделі(таблиці) юзера)
    //Якщо данні не будуть розкриті через популейт, то ми зможемо доступитися тільки до айді курсу, но не його даних.
    //Метод execPopulate() саме виконує запит всередині популейта.
    const user = await request.userCreatedTest.populate('cartData.items.courseId').execPopulate(); 
    // console.log(user.cartData.items[0].courseId._id)
    // console.log(user)
    const courses = mapCartItems(user.cartData)

    const cart = { 
        courses, price: computeCurrency(courses)
    }

    response.status(200).json(cart) //Повертаємо оновлені данні у fetch (app.js файлу)
})

//Повертаэмо масив об'єктів з потрібними нам параментрами курсів
function mapCartItems(cartData) {

    //_doc дає можливість доступатися до реальних (всіх) даних (полів) mongoose об'єктів

    //Всі варіанти доступу до id курсу

    //console.log(cartData.items[0].courseId._doc._id)

    //=====********* Виводять аналогічні дані *********==========
    // console.log(cartData.items[0])
    // console.log(cartData.items[0]._doc)
    // //=====********* Виводять аналогічні дані *********==========
    // console.log(cartData.items[0].courseId)
    // console.log(cartData.items[0].courseId._doc)
    //===========================================================
    // console.log(cartData.items[0].courseId.id)
    // console.log(cartData.items[0].courseId._id)
    // console.log(cartData.items[0].courseId.ID())

    return cartData.items.map(c => ({ ...c.courseId._doc, id: c.courseId._doc._id, amount: c.amount }) ) //id: c.courseId.id - Невідомо звідки береться це поле, але варіант також робочий
}

function computeCurrency(cartData)
{
    //Де item це окремий об'єкт який зберігає усі властивості курсу
    return cartData.reduce((result, item) => {
        let counter = 0
        while(counter < item.amount)
        {
            counter++;
            result += item.price;
        }
        return result;
        //Ще один спосіб : result += item.price * item.amount
     },0)
}

module.exports = { mapCartItems, computeCurrency }

router.get('/', async (request, response) => {
    //Отримуємо більш розширену інформацію про курс, айді якого знаходиться в корзині конкретного юзера.
    //execPopulate() - виконує запит populate(); (Збільшує інформацію про курс через доступ до його айді) (Робить айді курсі повноцінним об'єктом зі всіма полями курсу)
    const userCart = await request.userCreatedTest.populate('cartData.items.courseId').execPopulate()
    const courses = mapCartItems(userCart.cartData)
    //console.log(courses[0])
    response.render('cart', { isCart: true, title: "Cart", courses: courses, price: computeCurrency(courses) });
    //console.log(userCart.cartData.items)
    //console.log(require.userCreatedTest.cartData.items[0].courseId._doc)
    //console.log(userCart.cartData.items[0].courseId._doc)
    //console.log(require.userCreatedTest)

    // const cart =  await CartModel.fetch();
    // console.log(cart)
    // response.render('cart', { isCart: true, title: "Cart", courses: cart.courses, price: cart.price});

})

module.exports = router;