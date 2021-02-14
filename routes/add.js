const {Router} = require('express')
const CourseModel = require('../models/courseModel')
const protectionMiddleware = require('../middleware/routeProtection')
const router = Router();

router.get('/add', protectionMiddleware, (request, response) => {
    
    //response.sendFile(path.join(__dirname, 'views', 'about.html'))
    response.render('add', {
        title: "Add page",
        isAdd: true
    })

 });

 //Можна не вказувати async, але тоді нам прийдеться зачейнити model.save(), оскільки повертається проміс
router.post('/add',  async (request, response) => {
    
    //const dataModel = new CourseModel(request.body.title, request.body.price, request.body.img);

    //for mongoose model
    const dataModel = new CourseModel({ title: request.body.title, price: request.body.price, url: request.body.img, userId: request.userCreatedTest._id })
    try
    {
        //Повертаємо вже опрацьований проміс (повертаємо готовий результат)
        //from mongoose mehtod (save())
        await dataModel.save();
        response.redirect('/courses');
    }
    catch(e)
    {
        console.error(e)
    }
})

 module.exports = router;