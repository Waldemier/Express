

//************************************ Після підключення mongodb більше не використовується ****************************************

const path = require('path')
const fs = require('fs');
const CourseModel = require('./courseModel');

//Ще один спосіб доступу до файлу (збержених даних корзини)
//const p = path.join(path.dirname(mainModule.filename), 'data', 'cart.json')

class CartModel {

    static async add(course)
    {
        const dataCart = await CartModel.fetch();

        if(dataCart.courses.find(c => c.id === course.id))
        {
            dataCart.courses.find(c => c.id === course.id).amount += 1;
            dataCart.price += +course.price;
        }
        else
        {
            course.amount = 1
            dataCart.courses.push(course)
            dataCart.price += +course.price;
        }

        return new Promise((resolve,reject) =>{
            fs.writeFile(path.join(__dirname, '..' , 'data', 'cart.json'), JSON.stringify(dataCart), (error, data) =>{
                if(error) reject(error);
                resolve();
            })
        })

    }

    static async remove(courseId){
        
        const search = await CartModel.fetch();
        const courseIndex = search.courses.findIndex(c => c.id === courseId);
        if(search.courses[courseIndex].amount === 1)
        {
            //delete
            search.price -= +search.courses[courseIndex].price
            search.courses = search.courses.filter(c => c.id !== courseId); 
        }
        else 
        {
            //--
            search.courses[courseIndex].amount--
            search.price -= +search.courses[courseIndex].price
        }

        return new Promise((resolve, reject) =>{
            fs.writeFile(path.join(__dirname, '..' , 'data', 'cart.json'), JSON.stringify(search), error => { if(error) reject(error); resolve(search) })
        })

    }

    static async fetch()
    {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..' , 'data', 'cart.json'), 'utf-8', (err,data) => {
                if(err) reject(err)
                resolve(JSON.parse(data))
            })
        })
    }

}

module.exports = CartModel;