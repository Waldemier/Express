

const {Router} = require('express')
const CourseModel = require('../models/courseModel.js')
const router = Router();
const protectionMiddleware = require('../middleware/routeProtection')


router.get('/', async (request, response) => {
   
   try
   {
      //const data = await CourseModel.getFileData();

      //from mongoose method
      const data = await CourseModel.find()  //All data from database
      .populate('userId', 'email userName') //Для отримання більш розширеної інформації про користувача в полі userId (Другий параметр необов'язковий)
                                          //Першим параметром передавалось id юзера, яке мало розкрити його дані в таблиці, а другий параметр якраз розкриває тільки деякі поля, які ми вказали.

      .select('title price url') //Типова DB команда (Обираємо тільки ці властивості з моделі)


      //response.sendFile(path.join(__dirname, 'views', 'about.html'))
      response.render('courses', {
         title: "Courses page",
         isCourses: true,
         userId: request.userCreatedTest ? request.userCreatedTest._id.toString() : null,
         data
      })

   } catch(e) {
      console.error(e);
   }

});

router.get('/:id', async (request, response) => {

    try
    {
      // const course = await CourseModel.getCourseById(request.params.id); //Повернули об'єкт з заданим id

      //from mongoose method
      const course = await CourseModel.findById(request.params.id);
      response.render('course', { layout: 'empty', title: course.title, course })

    } catch(e)
    {
      console.error(e);
    }
    
})


 router.get('/:id/edit', protectionMiddleware, async (request, response) => {

   if(!request.query.allow) response.redirect('/'); //Якщо в url не буде присутня змінна allow -> redirect
   //const course = await CourseModel.getCourseById(request.params.id)

   try {
   //from mongoose method
   const course = await CourseModel.findById(request.params.id)
   if(course.userId.toString() === request.userCreatedTest._id.toString())
   {
      response.render('course-edit', { title: "Edit", course } )
   }
   else
   {
      response.redirect('/courses');
   }

   } catch(e) {

      console.error(e)

   }

})

router.post('/remove', async (request, response) => {

   try
   {
      await CourseModel.deleteOne({ _id: request.body.id, userId: request.userCreatedTest._id });
      response.redirect('/courses')
   }
   catch(e)
   {
      console.error(e)
   }
     
})

router.post('/edit', protectionMiddleware, async (request, response) => {

   //await CourseModel.update(request.body); //Використовувалось, коли ми самі проектували методи (до використання дб)
   try {
      const course = await CourseModel.findOne({ _id: request.body.id })
      if(course.userId.toString() === request.userCreatedTest._id.toString())
      {
         //from mongoose method
         //await CourseModel.findByIdAndUpdate(request.body.id, request.body); 
         Object.assign(course, request.body); //За допомогою Object.assign ми внесли зміни до нашого поточного курсу (зверху минула реалізація)
         await course.save();
         response.redirect('/courses');
      }
      else 
      {
         response.redirect('/courses');
      }

   } catch(e) {
      console.error(e);
   }
   
})


module.exports =  router;