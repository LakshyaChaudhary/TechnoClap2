const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../helpers/auth');
require('../helper');
router.get('/loginuser',(req,res)=>{
  res.render('users/loginuser');
})

router.get('/logintechnician',(req,res)=>{
  res.render('users/logintechnician');
})

router.get('/registeruser',(req,res)=>{
  res.render('users/registeruser');
})

router.get('/registertechnician',(req,res)=>{
  res.render('users/registertechnician');
})

router.post('/registeruser',(req,res)=>{
  const errors = [];
  if(req.body.password != req.body.password2){
    errors.push({text:"Passwords do not match!"})
  }
  if(req.body.password.length < 4){
    errors.push({text:"Password must be at least of 4 characters"})

  }

  if(errors.length > 0){
    res.render('users/registeruser',{
      errors: errors,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    })

  } else {
    db.query(`SELECT * FROM users WHERE email='${req.body.email}'`,(err,result)=>{
      if(result.length !== 0){
        req.flash('error_msg','Email already registered');
        res.redirect('/users/registeruser');
      } else {
        const newUser =  {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          address: req.body.address,
          city: req.body.city,
          pincode: req.body.pincode,
          contact : req.body.contact

        }
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            newUser.password = hash;
            db.query('INSERT INTO users SET?',newUser,(err,result)=>{
              if(err){throw err}
              console.log(result);
              req.flash('success_msg','You are now registered and can log in!');
              res.redirect('/users/loginuser');
            })
            
          })
        })
      }
    })
  }
})

// router.post('/registertechnician',(req,res)=>{
//   const errors = [];
//   if(req.body.password != req.body.password2){
//     errors.push({text:"Passwords do not match!"})
//   }
//   if(req.body.password.length < 4){
//     errors.push({text:"Password must be at least of 4 characters"})

//   }

//   if(errors.length > 0){
//     res.render('users/registertechnician',{
//       errors: errors,
//       username: req.body.username,
//       email: req.body.email,
//       password: req.body.password,
//       password2: req.body.password2
//     })

//   } else {
//     db.query(`SELECT * FROM technicians WHERE email='${req.body.email}'`,(err,result)=>{
//       if(result.length !== 0){
//         req.flash('error_msg','Email already registered');
//         res.redirect('/users/registertechnician');
//       } else {
//         const newUser =  {
//           username: req.body.username,
//           email: req.body.email,
//           password: req.body.password,
//           address: req.body.address,
//           city: req.body.city,
//           pincode: req.body.pincode,
//           contact : req.body.contact,
//           field: req.body.field

//         }
//         bcrypt.genSalt(10,(err,salt)=>{
//           bcrypt.hash(newUser.password,salt,(err,hash)=>{
//             if(err) throw err;
//             newUser.password = hash;
//             db.query('INSERT INTO technicians SET?',newUser,(err,result)=>{
//               if(err){throw err}
//               console.log(result);
//               req.flash('success_msg','You are now registered and can log in!');
//               res.redirect('/users/login');
//             })
            
//           })
//         })
//       }
//     })
//   }
// })

router.get('/home/:id',(req,res)=>{
  console.log(req.params)
  db.query(`SELECT * FROM users WHERE id=${req.params.id}`,(err,user)=>{
    if(err){throw err}
    res.render('home/welcomeuser',{
      id:req.params.id,
      username:user[0].username,
      payment:true,
      history:true
    });
  })
  // res.render('home/welcomeuser',{
  //   id:req.params.id,
  //   username:req.params.username
  // });
})

router.post('/loginuser', (req,res)=>{
  let password = req.body.password;

  db.query(`SELECT * FROM users WHERE users.email='${req.body.email}'`,(err,user)=>{
    if(err){throw err;}
    console.log(user);
    
    if(user.length === 0){
      req.flash('error_msg','No use found');      res.redirect('/users/loginuser')
    } else {
    bcrypt.compare(password,user[0].password,(err,isMatch) => {
      if(err) throw err;
      if(isMatch){
        // res.redirect(`/users/home/${user[0].id}`)
        // res.render('home/welcomeuser',{
        //   ID: user[0].id,
        //   username: user[0].username
        // })
        res.redirect(`/users/home/${user[0].id}`)
      } else {
        req.flash('error_msg','Wrong password');
        res.redirect('/users/loginuser');
      }
    })
  }
})
  
  // passport.authenticate('local',{
  //   successRedirect: '/users/home',
  //   failureRedirect: '/users/loginuser',
  //   failureFlash: true
  // })(req,res, next);
});
router.get('/logout',(req,res)=>{
  req.logout();
  // req.flash('success_msg','You are logged out');
  res.redirect('/');
})
router.post('/techselect/:id',(req,res)=>{
  
  db.query(`SELECT * FROM technicians WHERE field='${req.body.choice}'`,(err,user)=>{
    if(err){throw err;}
    
    
    // let x=JSON.stringify(user);
    // console.log(x);
    // console.log(typeof x);
    // x=JSON.parse(x);
    // console.log(x);

    console.log(req.params.id)
    
    res.render('home/welcomeuser',{
      user:user,
      history:true,

       id:req.params.id
    })
    // res.redirect(`/users/home/${req.params.ID}/${req.params.username}/${user}`)
})
})
router.get('/payment/:id',(req,res)=>{
  db.query(`SELECT * FROM request,technicians WHERE userid=${req.params.id} AND status='Accept' AND paymentStatus='no' AND request.techid=technicians.id`,(err,result)=>{
    if(err){throw err}
    console.log(result);
    res.render('users/payment',{
      id:req.params.id,
      payment:true,
      results:result,
      history:true
    });
  })
  // db.query(`SELECT * FROM request,technicians `,(err,result)=>{
  //   if(err){throw err}
  //   console.log(result);
  //   res.render('users/payment',{
  //     id:req.params.id,
  //     payment:true,
  //     results:result
  //   });
  // })
 
})

router.get('/paymentpage/:userid/:reqid',(req,res)=>{
  res.render('users/paymentpage',{
    id:true,
    reqid:req.params.reqid,
    userid:req.params.userid,
    history:true
  });
})

router.post('/paymentupdate/:userid/:reqid',(req,res)=>{
  db.query(`UPDATE request SET paymentStatus='yes' WHERE requestid=${req.params.reqid}`,(err,result)=>{
    if(err){throw err}
    console.log(result);
    db.query(`SELECT amount,techid FROM request WHERE requestid=${req.params.reqid}`,(err,result)=>{
      if(err){throw err}
      console.log(result);
      let newPayment = {
        techid: result[0].techid,
        amount: result[0].amount,
        userid: req.params.userid
      }
      db.query('INSERT INTO Payment SET?',newPayment,(err,result)=>{
        if(err){throw err}
        console.log(result);
        req.flash('success_msg','Payment Successful');
        // res.redirect(`/users/home/${req.params.userid}`);
      })

    })
    req.flash('success_msg','Payment Successful'); res.redirect(`/users/home/${req.params.userid}`)
  })
  
})

router.get('/history/:id',(req,res)=>{
  db.query(`SELECT * FROM Payment,technicians WHERE userid=${req.params.id} and techid=technicians.id`,(err,results)=>{
    if(err){throw err}
    console.log(results);
    res.render('users/history',{
      results:results,
      id:true,
      payment:true,
      history:true
    })
  })
})

module.exports = router;