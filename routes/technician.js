const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../helpers/auth');
require('../helper');


router.get('/registertechnician',(req,res)=>{
    res.render('users/registertechnician');
  })
  router.get('/logintechnician',(req,res)=>{
    res.render('users/logintechnician');
  })

  router.post('/registertechnician',(req,res)=>{
    const errors = [];
    if(req.body.password != req.body.password2){
      errors.push({text:"Passwords do not match!"})
    }
    if(req.body.password.length < 4){
      errors.push({text:"Password must be at least of 4 characters"})
  
    }
  
    if(errors.length > 0){
      res.render('users/registertechnician',{
        errors: errors,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2
      })
  
    } else {
      db.query(`SELECT * FROM technicians WHERE email='${req.body.email}'`,(err,result)=>{
        if(result.length !== 0){
          req.flash('error_msg','Email already registered');
          res.redirect('/users/registertechnician');
        } else {
          const newUser =  {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            city: req.body.city,
            pincode: req.body.pincode,
            contact : req.body.contact,
            field: req.body.field
  
          }
          bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
              if(err) throw err;
              newUser.password = hash;
              db.query('INSERT INTO technicians SET?',newUser,(err,result)=>{
                if(err){throw err}
                console.log(result);
                req.flash('success_msg','You are now registered and can log in!');
                res.redirect('/technician/logintechnician');
              })
              
            })
          })
        }
      })
    }
  }) 

  router.get('/home',(req,res)=>{
      res.render('home/welcometechnician');
  })



  router.post('/logintechnician', (req,res,next)=>{
    let password = req.body.password;
    db.query(`SELECT * FROM technicians WHERE technicians.email='${req.body.email}'`,(err,user)=>{
      if(err){throw err;}
      console.log(user);
      if(user.length === 0){
        return done(null,false,{message:"No User Found"})
      }
      bcrypt.compare(password,user[0].password,(err,isMatch) => {
        if(err) throw err;
        if(isMatch){
          res.render('home/welcometechnician',{
            log:false,
            user:user[0].username
          })
        } else {
          return done(null,false,{message:"Password Incorrect"})
        }
      })
  })
        
  //  passport.authenticate('local',{
  //     successRedirect: '/technician/home',
  //     failureRedirect: '/technician/logintechnician',
  //     failureFlash: true
  //   })(req,res, next);
  });
 
  module.exports = router;