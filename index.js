// Mongo pass : 8C4tKanjCeFRQn7x
//Mongo connect url : mongodb+srv://DataAdmin:<password>@cluster0.qk2hz.mongodb.net/<dbname>?retryWrites=true&w=majority

// mongodb+srv://DataAdmin:8C4tKanjCeFRQn7x@cluster0.qk2hz.mongodb.net/<dbname>?retryWrites=true&w=majority

//*********Посилання на приклад вирішення помилок при використанні mongoose + handlebars : 
                        //https://www.npmjs.com/package/@handlebars/allow-prototype-access#usage--express-handlebars-and-mongoose-

const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access') //Для безпроблемної роботи handlebars та mongoose
const Handlebars = require('handlebars')
const mongoose = require('mongoose')

const express = require('express')
const path = require('path')
const expressHandlebars = require('express-handlebars') //npm
const homeRouter = require('./routes/home')
const coursesRouter = require('./routes/courses')
const addRouter = require('./routes/add')
const cartRouter = require('./routes/cart')
const ordersRouter = require('./routes/orders')
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')

const session = require('express-session') // npm
const MongoStore = require('connect-mongodb-session')(session) //npm //Приймаємо клас session з пакету для зберігання сесій в бд

const protectionMiddleware = require('./middleware/routeProtection')
const userModelFixMiddleware = require('./middleware/userModelFix')

//Підключення власно написаного middleware'а
const AuthMiddleware = require('./middleware/isAuthMiddleWare')
const csurf = require('csurf') // npm // Спеціальний токен для захисту форм //Потірбно підключати як мідлвейр + може приймати параметри

const flash = require('connect-flash') //npm
const CONFIGURE_VALUES = require('./configuration/configurationKeys') //Винесені деякі головні константи цього проекту в окремий файл
const HANDLEBARS_HELPER_UTILITS = require('./utils/handlebars-helper')
const NotFound404Middleware = require('./middleware/NotFound')

const fileMiddleware = require('./middleware/fileDownload')

//const UserModel = require('./models/userModel') //Users Table

//===== 1 (Basics) / 2 (Express get request / methods) / 3 (handlebars): pug, ejs, handlebars* (Движки (Шаблонізатори) для рендеренгу html сторінок)  =======
//=====/ 4 Налаштування layout (макету) Description: Макет (layout) потрібний для рендеренгу на ньому наших html сторінок / 5 (navbars)  ===== 
//===== / 6 Routers ===== ....

const express_app = express(); //Аналогія до http.createServer()

//Шаблонизатор - це документ який генерує всі інші необхідні документи при переході на різні сторінки. 
//Таким чином не доводиться створювати окремих html сторінок (ДОМ), а лише зберігати всі необхідні данні (теги та контент) в окремому документі .hbs, 
//який пізніше можна згенерувати в нашому шаблонізаторі через ключові символи {{{ body }}}, 
// де body це тіло нашого документу (html) з данними, які ми хочемо згенерувати в шаблонізаторі .
const handlebars = expressHandlebars.create({
    defaultLayout: 'main',    
    extname: 'hbs', //По дефолту handlebars (Задаємо розшир   ення, яке буде застосоване для документів шаблонізатора (і до самого шаблонізатора))
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: HANDLEBARS_HELPER_UTILITS
});

//Створення коллекції в якій будуть зберігатися сесії в бд. 
//Також параметром передається ключ доступу до бд.
const store = new MongoStore(
    {
        collection: 'sessions',
        uri: CONFIGURE_VALUES.MONGO_URI
    }
);

//Після цих стрічок перейменовуємо розширення .html в .hbs (таким чином VS Code розуміє, що це є handlebars).
express_app.engine('hbs', handlebars.engine); //Реєструємо движок (шаблонізатор), який ми будемо використовувати в експресі. (Перший параметр - розширення движку)
express_app.set('view engine', 'hbs');  //(Після цього методу ми вже можемо використовувати наш зареєстрований движок).
express_app.set('views', 'views'); //Тут ми вказуємо в якій папці будуть зберігатися шаблони html сторінок (по-замовчуванню views (другий параметр)).

// ** Загалом, якщо нам потрібно доступитися до даних не через redirect або render, та імпорт не підходить,
// оскільки це не модуль (модулі це те, що ми експортуємо як module.export), тоді ми маємо задавати статичні папки, для доступу до даних. **
//PS.Передивитись приклади використання файлів папки public та зберігання файлів (картинок) у папку images та доступу до цих картинок в profile.hbs.

//Без задання статичної папки ми не зможемо, навіть підключивши css до html-ДОМ, доступитися до стилів. (Не зможемо зайти в файл цієї папки)
//Те саме й з app.js, у нас там реалізований метод fetch, з якого в cart.js (в метод delete) передається деякий запит на видалення деякого елемента,
// та після того запиту оновленні данні мають повернутися назад (а назад вони повернутись не зможуть, якщо не буде доступу до папки).

express_app.use(express.static(path.join(__dirname, 'public'))) //Підключення підгрузки додаткових елементів (це можуть бути css стилі, картинки, інші html сторінки  і тд)
                                        //В нашому випадку ми підключили додаткові css стилі для нашого макету (layout).
                                       // PS. Без цього підключення програма видасть помилку щодо підключення файлу.
express_app.use('/images', express.static(path.join(__dirname, 'images'))) //Задання статичної папки, для доступу мідлвейру до неї, для збереження контенту.
                                    //Чому ми задаємо напочатку /images ? Відповідь: 
                                    //Express выполняет поиск файлов относительно статического каталога, поэтому имя статического каталога не является частью URL 
                                    //(а нам воно потрібне пізніше для доступу до картинок по повному шляху в profile.hbs,
                                    // оскільки в базі даних зберігається повний шлях до файлу (картинки)
                                    //(EX: images/...png)).

express_app.use(express.urlencoded({ redirect: true })); //Ініціалізується для того, щоб була можливість доступатися до даних (парсити дані) з форм, 
                                                        // які ми відправляємо (post запитом).

//Підключення сессії
express_app.use(session({
    secret: CONFIGURE_VALUES.SESSION_SECRET_VALUE, //Ширфування сесії на основі стрічки
    saveUninitialized: false,
    resave: false,
    store
}))


//При підключенні нових мідлвеєрів у request'a з'являються нові поля, доприкладу такі як: request.csrfToken(), request.file, і тд.

express_app.use(fileMiddleware.single('avatar')) //single - тільки один файл буде завантажуватись, з дефолтним полем avatar.
//csurf пакет дає нам додатковий захист даних від зловмисників
express_app.use(csurf()); //Добавлений в response.local у isAuthMiddleWare файлі, оскільки шифрований ключ повинен повертатись на сторону клієнта.
express_app.use(flash()); //Мідлвейр для обробки помилок. Ex: request.flash('error', 'Somehappened')

//Використовувалось до створення сесії

// express_app.use(async (request, response, next) => { //middleware
//     try
//     {
//         const user = await UserModel.findById('600b01b22c32485408a987ae')
//         request.userCreatedTest = user; //Ствоврили поле юзер та присвоїли йому тествого юзера з таблиці
//         next(); //Після ініціалізації на проекті тестового юзера даємо можливість генерування наступним middleware'ам
//     }
//     catch(e) {
//         console.error(e)
//     }

// })

//add own middleware
//PS. Дані, які передаються в мідлвейр - передаються в response, і таким чином попадають на шаблон.
express_app.use(AuthMiddleware); 
//Мідлвейр, який вирішує проблему з даними юзера при популейті.
express_app.use(userModelFixMiddleware);

//Роутери 
//Першим параметром можемо вказувати шлях нашого роуту (параметр є необов'язковим, але покращує читабельність коду),
// якщо вказувати перший параметр, то в коді самого роуту потрібно вказати шлях '/' щоб він не повторювався і не виникала ситуація /about/about.                               
express_app.use('/', homeRouter);
express_app.use('/courses', coursesRouter);
express_app.use(addRouter); //protectionMiddleware добавили всередині самої реалізації роутера
express_app.use('/cart', protectionMiddleware, cartRouter);
express_app.use('/orders', protectionMiddleware, ordersRouter);
express_app.use('/auth', authRouter);
express_app.use('/profile', profileRouter);
//Приклад минулої реалізації, до знайомства з роутерами. (Альтернатива use роутерам)
express_app.get('/about', (request, response) => {

    //response.sendFile(path.join(__dirname, 'views', 'about.html'))
    response.render('about', {
        title: "About page", //Задали власні змінні, до яких пізніше можна доступитися в макеті (доприкладу для зміни вмісту Title при переході до іншої сторінки)
     })

 });

express_app.use(NotFound404Middleware);



const PORT = process.env.PORT || 3000;

//start mongoose
async function start() {

    try
    {

        await mongoose.connect(CONFIGURE_VALUES.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

        // const test_candidate = await UserModel.findOne(); //Якщо в таблиці є хоч щось то...

        // if(!test_candidate)
        // {
        //     const user = new UserModel({ userName: "TestSoloUser", email: "user@gmail.com", cartData: { items:[] }});
        //     await user.save();
        // }
        express_app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

    }
    catch(error)
    {
        console.error(error)
    }
    
}

start()






