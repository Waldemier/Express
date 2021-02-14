module.exports = function(request, response, next)
{
    if(!request.session.isAuthenticated)
    {
        return response.redirect('/auth/login'); //Використовуємо ретурн для того, щоб не повертатись до функції обробника /add,
                                                // і таким чином одразу припиняємо всі процеси програми.
    }
    //Продовження цепочки middleware'ів
    next();
    
}