var express = require('express');
var router = express.Router();

// Get Homepage
// router.get('/', function(req, res){
// 	res.render('./layouts/SignInSignUp');
// });
router.get('/', ensureAuthenticated, function(req, res){
	if (req.user.firstName == "")
		res.render('./layouts/Edit_Profile_Student')
	else
		res.render('./layouts/TEMPLATE');
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
	res.render('./layouts/Resources_Instructor');
})

router.get('/addStudent', ensureAuthenticated, function(req,res){
	res.render('./layouts/AddStudent');
})
module.exports = router;