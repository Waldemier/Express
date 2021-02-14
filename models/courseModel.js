//Model from mongoose

const { Schema, model } = require('mongoose')


//By the default id will generated
const courseModel = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    url: String,
    userId: { type: Schema.Types.ObjectId, ref: "UserModel" }
})


//Виклик в cart:32рядок : id: c.courseId.ID()
courseModel.method('ID', function(){ //Робоча аналогія неправильно реалізованому методу нижче (toClient)
    console.log("PASSED")
    let id = this._id;
    delete this._id;

    return id; 
})

//********************** Метод повнюстю не валідний та не робочий *********************************** Владилен допустив помилку

// courseModel.method('toClient', function(){ //Ніде не використовується (промах курсу) Без цього методу програма чудово працює.
    
//     const course = this.Object(); //Отримуємо об'єкт нашого курсу (оскільки просто написавши this так не спрацює)
//     course.id = course._id // Створюємо поле id та переприсвоюємо йому наш унікальний ідентифікатор 
//                             //(Робиться це для того, щоб не було помилок з id, яке ми писали в різних частинах коду, 
//                             //коли реалізовували моделі через класи (там ми використовували поле id, а тепер в нас _id)).

//     delete course._id //Необов'язково, але видаляємо минуле айді для того щоб не використовувалось багато трафіку при передачі даних 
//                     //(тим більше що двох однакових айді нам не потрібно тримати).
//     return course;

// })

module.exports = model('CourseModel', courseModel)




//Model from file db

// const path = require('path')
// const fs = require('fs');
// const uuid = require('uuid');

// class CourseModel {
//     constructor(title, price, url)
//     {
//         this.title = title;
//         this.price = price;
//         this.url = url;
//         this.id = uuid.v4();
//     }
//     getDataObject() //Виклик статичних методів екземплярами класу забороняється (дозволяється використання тільки в межах класу).
//     {
//         return { title: this.title, price: this.price, url: this.url, id: this.id };
//     }
//     async save()
//     { 
//         const data = await CourseModel.getFileData();
//         data.push(this.getDataObject());

//         console.log(data)
//         return new Promise((resolve, reject) => {
//             fs.writeFile(path.join(__dirname, '..', 'data', 'data.json'), JSON.stringify(data), (error) => { if(error) { reject(error)} else { resolve() }})

//         })
//     }

//     static getFileData()
//     {
//         return new Promise((resolve, reject) => {
//             fs.readFile(path.join(__dirname, '..', 'data', 'data.json'), 'utf-8', (error, data) => {
//                 if(error) reject(error);
//                 resolve(JSON.parse(data));
//             })
//         })   
//     }

//     static async getCourseById(id)
//     {
//         const data = await CourseModel.getFileData();
//         return data.find(course => course.id === id);
//     }

//     static async update(course){
//         const data = await CourseModel.getFileData();
//         const objectIndex = data.findIndex(c => c.id === course.id);
//         data[objectIndex] = course
//         return new Promise((resolve, reject) =>{
//             fs.writeFile(path.join(__dirname, '..', 'data', 'data.json'), JSON.stringify(data) , (error) => {
//                 if(error) reject(error);
//                 resolve();
//             })
//         })
//     }
// }

// module.exports = CourseModel
