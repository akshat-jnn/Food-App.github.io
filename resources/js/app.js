import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')


function updateCart(dish) {
    axios.post('/Updated-Cart', dish).then(res => {
        console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty ({
            type:'information',
            timeout:900,
            text: 'Dish added to cart'
        }).show()
    }).catch(err => {
        new Noty ({
            type:'error',
            timeout:900,
            text: 'Something went wrong !!!'
        }).show()

    })

}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let dish = JSON.parse(btn.dataset.dish)
        updateCart(dish)
    })
})


// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 1500)
}



// change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput') 
let order = hiddenInput ? hiddenInput.value: null
order = JSON.parse(order)
let time = document.createElement('small')


function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if(stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp === order.status) {
            stepCompleted = false 
            time.innerText = moment (order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
              status.nextElementSibling.classList.add('current')   
            }
        }
    })
}

updateStatus(order);


//socket
let socket = io()
//join
if(order) {
    socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = {...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty ({
        type:'success',
        timeout:900,
        text: 'Your Order Updated',
        progressBar: false
    }).show()
})