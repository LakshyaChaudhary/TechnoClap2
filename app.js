const express = require('express');
const mysql = require('mysql');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const db = require('./config/database');
const exphbs = require('express-handlebars');
const users = require('./routes/users');
const bodyParser = require('body-parser');
const technician = require('./routes/technician');

const app = express();
app.use(express.static(path.join(__dirname,'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
require('./config/passport')(passport);


app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
db.connect(err=>{
  if(err){throw err}
  console.log('MySql Connected');
});
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req,res,next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

app.get('/',(req,res)=>{
  res.render('index/welcome');
})

app.use('/users',users);
app.use('/technician',technician);
app.listen('5000',()=>{
  console.log('server started on port 5000...');
})

