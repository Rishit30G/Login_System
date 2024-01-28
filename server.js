if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express'); 
const app = express(); 
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const { User } = require('./userModel.js');
const intializePassport = require('./passport-config.js');


intializePassport(passport);
  
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(methodOverride('_method'));

app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAutheticated, (req, res)=>{
    res.render('index.ejs', {name: req.user.name})
}); 

app.get('/login', checkNotAutheticated, (req, res)=>{
    res.render('login.ejs');
}); 

app.post('/login', checkNotAutheticated, passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureFlash: true
}));

app.get('/register',checkNotAutheticated, (req, res)=>{
    res.render('register.ejs');
})

app.post('/register', checkNotAutheticated, async (req, res)=>{
    try{

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        };
        await User.create(newUser);
        res.redirect('/login');
    }
    catch(err){
        res.redirect('/register');
        res.status(500).send('Internal Server Error');
    }
});

app.post('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});


function checkAutheticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAutheticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

mongoose.connect("mongodb://localhost:27017/User").then(() => {
    console.log("Connected to Database");
    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}).catch((err) => {
    console.log(err);
}); 