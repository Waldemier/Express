const {Schema, model} = require('mongoose')

const orderModel = new Schema({
    courses: [{ course: {type:Schema.Types.ObjectId, ref:'CourseModel', required:true}, amount: {type:Number,required:true} }], //course потрібно було назвати courseId, оскільки зберігає тільки id
    user: {name:String, userId: {type:Schema.Types.ObjectId, ref: 'UserModel', required:true}},
    date: {type: Date, default: Date.now}
})


module.exports = model('OrderModel', orderModel)