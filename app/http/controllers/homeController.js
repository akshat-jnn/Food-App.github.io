const Menu = require('../../models/menu')

function homeController(){
    return{
        index(req , res) {
            Menu.find().then(function(dishes){
                //console.log(dishes)
                return res.render('home', {dishes: dishes})

            })
        }
    }
}


module.exports = homeController