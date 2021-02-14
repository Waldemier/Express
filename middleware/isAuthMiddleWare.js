module.exports = function(request, response, next){

    response.locals.isAuth = request.session.isAuthenticated;
    response.locals.csurf = request.csrfToken(); //Поле, яке з'явилось в результаті під'єднання пакету csurf (та підключення його в index.js через use).
                                                 //Отримуємо шифрований ключ для форм.
                                                // <input type="hidden" name="_csrf" value="{{csurf}}"> - Такий рядок коду ми повинні прописати у формах
                                                // Також, якщо ми використовуємо десь аякс, то повинні добавити хедр : 
                                                // headers: { 'X-XSRF-TOKEN': event.target.dataset.csrf } 
    //console.log(response.locals.csurf)
    next();

}