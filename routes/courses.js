

const {Router} = require('express')
const CourseModel = require('../models/courseModel.js')
const router = Router();

router.get('/', async (require, response) => {

    //const data = await CourseModel.getFileData();

    //from mongoose method
    const data = await CourseModel.find()  //All data from database
         .populate('userId', 'email userName') //Для отримання більш розширеної інформації про користувача в полі userId (Другий параметр необов'язковий)
         .select('title price url') //Типова DB команда


    //response.sendFile(path.join(__dirname, 'views', 'about.html'))
    response.render('courses', {

        title: "Courses page",
        isCourses: true,
        data

    })

 });

 router.get('/:id', async (request, response) => {
    // const course = await CourseModel.getCourseById(request.params.id); //Повернули об'єкт з заданим id

    //from mongoose method
    const course = await CourseModel.findById(request.params.id);
    response.render('course', { layout: 'empty', title: course.title, course })
 })


 router.get('/:id/edit', async (request, response) => {

    if(!request.query.allow) response.redirect('/');
    //const course = await CourseModel.getCourseById(request.params.id)

    //from mongoose method
    const course = await CourseModel.findById(request.params.id)
    response.render('course-edit', { title: "Edit", course } )

 })

 router.post('/remove', async (request, response) => {
     try
     {
        await CourseModel.findByIdAndDelete({ _id: request.body.id });
        response.redirect('/courses')
     }
     catch(e)
     {
        console.error(e)
     }
     
 })

 router.post('/edit', async (request, response) => {
     //await CourseModel.update(request.body);

    //from mongoose method
    await CourseModel.findByIdAndUpdate(request.body.id, request.body);
    response.redirect('/courses');
 })


 module.exports =  router ;