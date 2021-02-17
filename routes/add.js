const {Router} = require('express')
const CourseModel = require('../models/courseModel')
const protectionMiddleware = require('../middleware/routeProtection')
const { coursesValidators } = require('../utils/validators')
const { validationResult } = require('express-validator/check')

const router = Router();

router.get('/add', protectionMiddleware, (request, response) => {
    
    //response.sendFile(path.join(__dirname, 'views', 'about.html'))
    response.render('add', {
        title: "Add page",
        isAdd: true,
    })

 });

 //Можна не вказувати async, але тоді нам прийдеться зачейнити model.save(), оскільки повертається проміс
router.post('/add', coursesValidators, async (request, response) => {

    const errors = validationResult(request)
   if(!errors.isEmpty())
   {
      request.flash('addError', errors.array()[0].msg)
      return response.status(422).render('add', { title: "Add page", isAdd: true, addError: request.flash('addError'), data: { title: request.body.title, price: request.body.price, url: request.body.url } })
   }

    //const dataModel = new CourseModel(request.body.title, request.body.price, request.body.img);

    //for mongoose model
    const dataModel = new CourseModel({ title: request.body.title, price: request.body.price, url: request.body.url, userId: request.userCreatedTest._id })
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