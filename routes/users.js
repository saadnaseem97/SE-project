var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('./layouts/SignInSignUp');
});

// Login
router.get('/login', function(req, res){
	res.render('./layouts/SignInSignUp');
});

// Register User
router.post('/register', function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	// var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var ContactNumber = req.body.ContactNumber;

	console.log(req.body)
	if (password == password2)
		console.log("FIT");
	else
		console.log(typeof password2);


	// Validation
	req.checkBody('firstName', 'First Name is required').notEmpty();
	req.checkBody('lastName', 'Last Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('ContactNumber', 'Email is not valid').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Passwords do not match').equals(req.body.password2);

	var errors = req.validationErrors();
	console.log(errors)
	if(errors){
		res.render('./layouts/SignInSignUp',{
			errors:errors
		});
	} else {
		var newUser = new User({
			firstName: firstName,
			lastName: lastName,
			email:email,
			password: password,
			ContactNumber: ContactNumber,
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		console.log('flash message')
		res.redirect('/');
	}
});

passport.use(new LocalStrategy( {usernameField: 'email',  
    passwordField: 'password'},
  function(email, password, done) {
  	

   User.getUserByEmail(email, function(err, user){
   	if(err) {
   		console.log(err);
   		throw err
   	};
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}
   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });


router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;