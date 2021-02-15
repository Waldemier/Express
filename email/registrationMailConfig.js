const CONFIGURE_VALUES = require('../configuration/configurationKeys')

module.exports = function(email) {
    return {
        from: CONFIGURE_VALUES.EMAIL_FROM, //При використанні сервісу gmail, from задається автоматично, на основі того аккаунта, який був вказаний у transporter
        to: email,
        subject: 'Account created successfully',
        html: `

            <h1>We congratulate you on the successful registration in our store!</h1>
            <p>You are registered with ${email}</p>
            <p>Have a good shopping</p>
            <hr />
            <a href="${CONFIGURE_VALUES.BASE_URL}">Courses store</a>
        `
    }
}