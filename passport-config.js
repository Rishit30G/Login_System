const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const {User} = require('./userModel.js');

function initialize(passport){

    const authenticateUser = async (email, password, done) => {
       const userByEmail = await User.findOne({email: email});
       if(userByEmail == null){
              return done(null, false, {message: 'No user with that email'});
       }
       try{
          const passwordDB = userByEmail.password;
           if(await bcrypt.compare(password, passwordDB)){
               return done(null, userByEmail);
           }
           else{
               return done(null, false, {message: 'Password incorrect'});
           }
       }
       catch(err){
           return done(err);
       }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });
    
}

module.exports = initialize;   