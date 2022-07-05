require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 1001
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')


//database connection
const url = 'mongodb://localhost/Food-App';
mongoose.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true})
.then( () => console.log("Database Connected..."))
.catch( (err) => console.log(err));


//Session Store
let mongoStore = new MongoDbStore({
    mongoUrl: url,
    collection: 'sessions'
 })

//event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


//Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 1}     // 1 hrs
}))


// passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Assets
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))


// global middleware
app.use((req, res, next) =>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views') )
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).send('<h1>404, page not found !!! Please check your url</h1>')
})


const server = app.listen(PORT , () => {
       console.log(`Listening on Port ${PORT}`)
})

//socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

