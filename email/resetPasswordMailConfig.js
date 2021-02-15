const CONFIGURE_VALUES = require('../configuration/configurationKeys')

module.exports = function(email,token) {
    return {
        from: CONFIGURE_VALUES.EMAIL_FROM, //При використанні сервісу gmail, from задається автоматично, на основі того аккаунта, який був вказаний у transporter
        to: email,
        subject: 'Reset password',
        html: `
            <h1>If you want to reset your password, follow this link <a href="${CONFIGURE_VALUES.BASE_URL}/auth/newpassword/${token}">change password</a></h1>
            <p>if you don't want to do it, just ignore this letter</p>
            <p>Sincerely, store administration</p>
            <a href="${CONFIGURE_VALUES.BASE_URL}">Courses store</a>
        `
    }
}