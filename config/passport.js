const LocalStrategy  = require('passport-local').Strategy;
const db = require('./database');
const bcrypt = require('bcryptjs');
module.exports = function(passport){
    
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {

    db.query(`SELECT * FROM users ,technicians WHERE users.email='${email}' or technicians.email='${email}'`,(err,user)=>{
        if(err){throw err;}
        
        if(user.length === 0){
          return done(null,false,{message:"No User Found"})
        }
        bcrypt.compare(password,user[0].password,(err,isMatch) => {
          if(err) throw err;
          if(isMatch){
            return done(null,user)
          } else {
            return done(null,false,{message:"Password Incorrect"})
          }
        })
    })

  }))

passport.serializeUser(function(user,done) {
  done(null, user[0].id);
});

passport.deserializeUser(function(id, done) {
    db.query(`SELECT * FROM users,technicians WHERE users.id=${id} or technicians.id=${id}`,(err,user)=>{
        done(err,user);
    })

});
 

 
}