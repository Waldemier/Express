const { Schema, model } = require('mongoose');


const userModel = new Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    cartData: { items: [ 
                            {
                                amount: { type: Number, required: true, default: 1 },
                                //Вказали що тип у нас буде унікальним id, який створю об'єкт Schema і ссилатися за ним ми будемо до іншої таблиці (таблиці курсів)
                                courseId: { type: Schema.Types.ObjectId, ref: 'CourseModel', required:true }
                            }
                ]}
})

userModel.method('clearCart', function ()
{
    this.cartData = {items:[]};
    return this.save();
})

userModel.method('addToCart', function(course) { // Ще один спосіб оголошення методів екземпляра (аналогія: userModel.methods.addToCart)

    //Приводимо до типу string, щоб дані коректно порівнювалися, оскільки в схемах у нас тип id : Schema.Types.ObjectId
    const courseIndx = this.cartData.items.findIndex(c => c.courseId.toString() === course._id.toString());

     if(courseIndx >= 0)
     {
        this.cartData.items[courseIndx].amount += 1;
     }
     else
     {
         this.cartData.items.push({ courseId: course._id,  amount: 1 })
     }  
     return this.save();
     
})

userModel.methods.removeFromCart = function(courseId)
{
    let items = [...this.cartData.items]
    const indx = items.findIndex(c => c.courseId.toString() === courseId.toString())

    if(items[indx].amount === 1)
    {
        items = items.filter(c => c.courseId.toString() !== courseId.toString())
    }
    else
    {
        items[indx].amount--;
    }
    this.cartData = {items};
    return this.save();
}

module.exports = model('UserModel', userModel)