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

  router.get('/home/:id/:username',(req,res)=>{
    db.query(`SELECT * FROM request WHERE (techid=${req.params.id}) and (status not in ('Reject'))`,(err,results)=>{
      if(err){throw err}
      console.log(results);
      res.render('home/welcometechnician',{
        id:req.params.id,
        username:req.params.username,
        results:results
      });
    })
     
  })



  router.post('/logintechnician', (req,res,next)=>{
    let password = req.body.password;
    db.query(`SELECT * FROM technicians WHERE technicians.email='${req.body.email}'`,(err,user)=>{
      if(err){throw err;}
      console.log(user);
      if(user.length === 0){
        req.flash('success_msg','No use found');      res.redirect('/technician/logintechnician')
      } else {
      bcrypt.compare(password,user[0].password,(err,isMatch) => {
        if(err) throw err;
        if(isMatch){
          // res.render('home/welcometechnician',{
          //   id: user[0].id,
          //   username: user[0].username
          // })
          res.redirect(`/technician/home/${user[0].id}/${user[0].username}`)
        } else {
          req.flash('success_msg','Incorrect Password');      res.redirect('/technician/logintechnician')
        }
      })
    }
  })
        
  //  passport.authenticate('local',{
  //     successRedirect: '/technician/home',
  //     failureRedirect: '/technician/logintechnician',
  //     failureFlash: true
  //   })(req,res, next);
  });
 router.get('/Electrician/:id1/:id2',(req,res)=>{
   res.render('field/electrician',{
     userid:req.params.id1,
     techid:req.params.id2,
     id:req.params.id1
   });
   
 })
 router.get('/Mechanic/:id1/:id2',(req,res)=>{
  res.render('field/mechanic',{
    userid:req.params.id1,
    techid:req.params.id2,
    id:req.params.id1
  });
})
router.get('/Plumber/:id1/:id2',(req,res)=>{
  res.render('field/plumber',{
    userid:req.params.id1,
    techid:req.params.id2,
    id:req.params.id1
  });
})
router.get('/Carpenter/:id1/:id2',(req,res)=>{
  res.render('field/carpenter',{
    userid:req.params.id1,
    techid:req.params.id2,
    id:req.params.id1
  });
})

router.post('/Electrician/:id1/:id2',(req,res)=>{
console.log(req.body);
let amount1;
if(req.body.field ==='a')
{
  amount1=1000;
} else if(req.body.field ==='b')
{
  amount1 = 2000;
} else if(req.body.field ==='c')
{
  amount1 = 3000;
} else {
  amount1 = 4000;
}
const newRequest =  {
  userid: req.params.id1,
  techid: req.params.id2,
  amount:amount1,
  task:req.body.field
}
db.query('INSERT INTO request SET?',newRequest,(err,result)=>{
  if(err){throw err}
  console.log(result);
  req.flash('success_msg','request sent');
  res.redirect(`/users/home/${req.params.id1}`);
})

})

router.post('/requestupdate/:techid/:techname/:reqid',(req,res)=>{
  db.query(`UPDATE request SET status='${req.body.selection}' WHERE id=${req.params.reqid}`,(err,result)=>{
    if(err){throw err}
    console.log(result);
    res.redirect(`/technician/home/${req.params.techid}/${req.params.techname}`)
  })
})
  module.exports = router;