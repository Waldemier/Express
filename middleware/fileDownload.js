const multer = require('multer') //npm || Робота з файлами


const storage = multer.diskStorage({ //Визначення місця де саме будуть зберігатися картинки, та з якою назвою

    //Специфічний синтаксис в якому третім параметром передається колбек
    //PS. Назви destination та filename обов'язкові по дефолту
    destination(request, file, callback) { callback(null, 'images') }, //Першим параметром передаємо можливі помилки (передали null, оскільки в нас їх не має бути), 
                                                                    //другим - де будуть зберігатися файли (вказано папку images)

    filename(request, file, callback) { callback(null, `${new Date().toISOString().replace(/:/g, '-')} - ${file.originalname}`) }, //З якою назвою (через додання дати добавили унікальність).
                                                                                                                                  // originalname - початкове ім'я файлу, при завантаженні.
                                                                                                                                // Замінили : на -, оскільки були проблеми з Content-security-policy, що не дозволяло завантажити картинку.
                                                                                                                               //PS. Альтернатива :  Просто використовувати Date.now() замість new Date().toISOString().
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'] //Масив дозволених розширень

const fileFilter = (request, file, callback) => { 

    if(allowedTypes.includes(file.mimetype)) //Перевірка чи наш завантажений файл відповідає переліченим розширенням
    { 
        callback(null, true); //Валідація пройдена
    } 
    else 
    { 
        callback(null, false); //Валідація не пройдена
    }

}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
});