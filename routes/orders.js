const {Router} = require('express');
const OrderModel = require('../models/orderModel');

const router = new Router();

/*
    Документація щодо exec() та execPopulate():

    - exec() : Використовується, якщо у нас 2 та більше populate'ів, приймає callback функцію, в яку передає два параметри: error та дані, які ми отримали в результаті популейтів.
                Використання необов'язкове, якщо ми не хочемо одразу ж обробити данні, які надійшли з популейтів.
                Ініціалізація без колбек функції ні до чого не призводить, хіба що ми явно бачимо, що мають виконатись деякі populate'и, які йдуть перед exec() (Читабельнійсть).
                Приклад нижче в router.get.
                
                PS. exec() використовується також при методах find(), findOne() та їх подібним, при використанні разом з популейтом (execPopulate() в таких випадках не спрацює (можна рахувати методи find як ще один додатковий популейт (як до прикладу))).

    - execPopulate(): Використовується, коли потрібно обробити лише один populate. Примає колбек функцію, яка приймає error та данні, які надійшли з популейту.
                        Використання необов'язкове, якщо нам не потрібно одразу ж обробляти дані, які надійшли з популейту.
                        Ініціалізація без колбек функції ні до чого не призводить, хіба до явного розуміння, що перед execPopulate, знаходиться популейт, який генерує якісь данні деякої таблиці (Читабельність).
    
    Стосується обох методів: Якщо в метод була передана колбек функція, то обробляти дані з популейтів у зовнішньому середовищі (наприклад змінних) тепер невдасться, з'являється щось накшталт договору,
                             який дозволяє обробляти дані тільки в тій колбек функції, яка була оголошена, і більше ніде.
*/

router.get('/', async (request, responce) =>
{

    try {

        //Доступ до замовлень конкретного користувача

        //=================== Приклад використання методу exec() та обробки даних в переданій колбек функції ===========================

        //const orders = await OrderModel.find({ 'user.userId': request.userCreatedTest._id })
        //    .populate('courses.course').populate('user.userId').exec((error, data) => { responce.render('orders', { title: 'Orders page', isOrder: true, orders: data.map(o => { return {...o._doc, price: o.courses.reduce((total, c) => { return total += c.amount * c.course.price },0)} }) }); }); //схема роботи: find({_ == _) ? true => user orders})

        //==============================================================================================================================

        //======== Приклад використання популейтів та обробки їхніх даних без використання методу exec() (Результат той самий) =========

        const orders = await OrderModel.find({ 'user.userId': request.userCreatedTest._id })
            .populate('courses.course').populate('user.userId'); //схема роботи: find({_ == _) ? true => user orders})

        //console.log(orders[orders.length - 1].courses[0].course)
        //const findOrderById = await OrderModel.findById('6021f73acc30e62808b3063c', (error, order) => { if(error)console.log(error); console.log(order) } ); //Експеримент (ніде не вик.)

        responce.render('orders', { title: 'Orders page', isOrder: true, orders: orders.map(o => { return {...o._doc, price: o.courses.reduce((total, c) => { return total += c.amount * c.course.price },0)} }) });

    } catch(e) {
        console.log(e);
    }
    
});


router.post('/', async (request,responce) =>
{

    try
    {
        const user = await request.userCreatedTest.populate('cartData.items.courseId').execPopulate(); //execPopulate() тут необов'язковий (Читати документацію зверху). Тут ми повернули юзера, і + до того популейтом розкрили деяке його поле, яке є екземпляром іншої таблиці.
        const courses = user.cartData.items.map(item => ({amount: item.amount, course: item.courseId })); //Щоб не прописувати return - обгортаємо в ()
        //console.log(courses)
        const order = new OrderModel({ 
            user: {
                name: request.userCreatedTest.userName,
                userId: request.userCreatedTest
            },
            courses  //courses : courses 
        });

        await order.save();
        await request.userCreatedTest.clearCart(); //Очистка кошика після реєстрації замовлення

        responce.redirect('/orders') //Пересилає нас у файл orders.hbs

    } catch(e) {
        console.error(e);
    }

})


module.exports = router;