var instance = M.Tabs.init(document.querySelector('.tabs')); //Підключення табів сторінки авторизації

const toCurrency = price => {
    return new Intl.NumberFormat('ua-UA', { currency: 'UAH', style: 'currency' }).format(price);
}

const toDate = date => {
    return new Intl.DateTimeFormat('ua-UA', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(date));
}

document.querySelectorAll(".date").forEach(DateNode => DateNode.textContent = toDate(DateNode.textContent))

document.querySelectorAll(".price").forEach(coursePrice => {
    coursePrice.textContent = toCurrency(coursePrice.textContent);
})

const $cartHtml = document.querySelector('#cart');

if($cartHtml)
{
    $cartHtml.addEventListener('click', event => { 
        //Перевірка на те, чи подія спрацювала саме на тому елементі, який нам потрібен (кнопка з класом js-remove)
        if(event.target.classList.contains('js-remove'))
        {   
            
            const courseId = event.target.dataset.id; // Доступилися до властивості data-id нашої кнопки
            const csurf = event.target.dataset.csrf;
            console.log(csurf)
            console.log(courseId)
            fetch("/cart/remove/" + courseId, { method: "DELETE", headers: { 'X-XSRF-TOKEN': csurf }})
                .then(data => data.json())
                .then(cart => {
                    if(cart.courses.length)
                    {
                        //Для кожного елементу генеруємо рядок
                        const html = cart.courses.map(c => {
                            return `
                                <tr>
                                    <td>${c.title}</td>
                                    <td>${c.amount}</td>
                                    <td><button class="btn btm-small js-remove" data-id="${c.id}" data-csrf="${csurf}">Delete</button></td>
                                </tr>
                            `
                        }).join('')
                        $cartHtml.querySelector('tbody').innerHTML = html;
                        $cartHtml.querySelector('.price').innerHTML = toCurrency(cart.price);
                    }
                    else
                    {
                        $cartHtml.innerHTML = '<p> Cart is empty </p>'
                    }
                })
        }
     })
}