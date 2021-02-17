module.exports = function(request, response, next)
{
    return response.status(404).render('404', { message: 'Page not found' });
}