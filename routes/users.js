var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://saadn22:Saad7223@ds131137.mlab.com:31137/tapro');
var db = mongoose.connection;

var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

var upload = multer({ storage: storage }).any();

var User = require('../models/user');

router.post('/addAssignment', upload, (req, res, next) => {
  console.log(req.files)
  res.redirect('/')
});

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

	// console.log(req.body)

	// Validation
	req.checkBody('firstName', 'First Name is required').notEmpty();
	req.checkBody('lastName', 'Last Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('ContactNumber', 'Contact Number is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Passwords do not match').equals(req.body.password2);


	var errors = req.validationErrors();
	console.log(errors)
	if(errors){
		res.render('./layouts/SignInSignUp',{
			errors:errors
		});
	} else {

	// 	User.getUserByEmail(email, function(err, user){
	// 	   	if(err) {
	// 	   		console.log(err)
	// 	   	};
	// 	   	if(user){
	// 	   		console.log("DUPLICATE");
	// req.flash('success_msg', 'You are logged out');
	// 	   		// req.flash('error_msg', 'Email already exists');
	// 	   		res.redirect('/users/login');
	// 	   	}
	//    	});
		console.log(email);
		var emailCheck = false;
		db.collection('users').findOne({email: email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } else {
		    	if(doc) {
		    		req.flash('error_msg', 'Email already exists');
		    		console.log("REDIRECT DUPLICATE")
					res.redirect('/users/login');
		      	}
		      	else{
		      		var newUser = new User({
						firstName: firstName,
						lastName: lastName,
						email:email,
						password: password,
						ContactNumber: ContactNumber,
						type: 'Instructor',
						ParentName: null,
						ParentContact: null
					});

					User.createUser(newUser, function(err, user){
						if(err) throw err;
						console.log(user);
					});

					req.flash('success_msg', 'You are registered and can now login');
					console.log('flash message')
					res.redirect('/users/login');
		      	}
		    }
		});
	}
});

router.post('/registerStudent', function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	// var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var ContactNumber = req.body.ContactNumber;
	var ParentContactNumber = req.body.ParentContactNumber;
	var pname = req.body.pname;


	// console.log(req.body)

	// Validation
	req.checkBody('firstName', 'First Name is required').notEmpty();
	req.checkBody('pname', 'Parent Name is required').notEmpty();
	req.checkBody('lastName', 'Last Name is required').notEmpty();
	req.checkBody('ContactNumber', 'Contact Number is required').notEmpty();
	req.checkBody('ParentContactNumber', 'Parent Contact Number is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Passwords do not match').equals(req.body.password2);


	var errors = req.validationErrors();
	console.log(errors)
	if(errors){
		res.render('./layouts/Edit_Profile_Student',{
			errors:errors
		});
	} else {
		let user = req.user;
		console.log(user)
		user.firstName = firstName;
		user.lastName = lastName;
		user.pname = pname;
		user.ContactNumber = ContactNumber;
		user.ParentContactNumber = ParentContactNumber;

		db.collection('users').updateOne({ 'email': user.email }, {$set : user}, function(err, docy) {
          if (err) {
             console.log(err);
           }
           res.redirect('/');
        });
	}
});

router.post('/addStudent', function(req, res){
	var email = req.body.email;
	var password = req.body.password;

	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	var errors = req.validationErrors();
	console.log(errors)
	if(errors){
		res.render('./layouts/AddStudent',{
			errors:errors
		});
	} else {

		var emailCheck = false;
		db.collection('users').findOne({email: email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } else {
		    	if(doc) {
		    		console.log("ERROR")
		    		req.flash('error_msg', 'Email already exists');
					res.redirect('/addStudent');
		      	}
		      	else{
		      		var newUser = new User({
						firstName: "",
						lastName: "",
						email:email,
						password: password,
						ContactNumber: "",
						type: 'Student',
						ParentName: "",
						ParentContact: ""
					});

					User.createUser(newUser, function(err, user){
						if(err) throw err;
						console.log(user);
					});
					console.log("ADDED ")
					req.flash('success_msg', 'Added User');
					console.log('flash message')
					res.redirect('/addStudent');
		      	}
		    }
		});

	}
});

passport.use(new LocalStrategy( {usernameField: 'email',  
    passwordField: 'password'},
  function(email, password, done) {
  	

   User.getUserByEmail(email, function(err, user){
   	if(err) {
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