module.exports = { 
    ifEqual(courseUserId, userId, options)
    {
        //console.log(courseUserId, userId)
        if(courseUserId.toString() === userId)
        {
            return options.fn(this);
        }
        return options.inverse(this);
    }
};