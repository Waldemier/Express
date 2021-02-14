const  { Router } = require('express')


const router = Router(); //Використовується для збереження різних частин коду в окремих файлах, та подальше їхнє підключення в основному файлі.
                        // Що дає нам більш зрозумілий та структурований код 

router.get('/', (request, response) => { // + next

    response.status(200); // Ініціалізація необов'язкова, йде по дефолту ( + Content-Type також )
    //response.sendFile(path.join(__dirname, 'views', 'index.html'));
    response.render('index', {
        title: "Home page",
        isHome: true
    })

 });

 module.exports =  router;