var express = require('express');
var router = express.Router();

// Get Homepage
// router.get('/', function(req, res){
// 	res.render('./layouts/SignInSignUp');
// });
router.get('/', ensureAuthenticated, function(req, res){
<<<<<<< HEAD
	res.render('./layouts/SignInSignUp');
=======
	if (req.user.firstName == "")
		res.render('./layouts/Edit_Profile_Student')
	else{
		if(req.user.type == "Instructor")
			res.render('./layouts/TEMPLATE');
		else if (req.user.type == "Student")
			res.render('./layouts/StudentMain');
	}
>>>>>>> 7d1c5e96fbf6ec5969c279a0c09333061978c06a
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

router.get('/profile', ensureAuthenticated, function(req,res){
	res.render('./layouts/ProfileInst');
})

router.get('/courses', ensureAuthenticated, function(req,res){
	if(req.user.type == "Instructor")
			res.render('./layouts/Resources_Instructor');
	else if (req.user.type == "Student")
		res.render('./layouts/Resources_Student');
})

router.get('/assignments', ensureAuthenticated, function(req,res){
	if(req.user.type == "Instructor")
			res.render('./layouts/Assignment_Instructor');
	else if (req.user.type == "Student")
		res.render('./layouts/Assignment_Student');
})

router.get('/addAssignment', ensureAuthenticated, function(req,res){
	res.render('./layouts/AddAssignDetails');
})
router.get('/addStudent', ensureAuthenticated, function(req,res){
	res.render('./layouts/AddStudent');
})
module.exports = router;