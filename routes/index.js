var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');

var mongoose = require('mongoose');
mongoose.connect('mongodb://saadn22:Saad7223@ds131137.mlab.com:31137/tapro');
var db = mongoose.connection;

// Get Homepage
// router.get('/', function(req, res){
// 	res.render('./layouts/SignInSignUp');
// });
router.get('/', ensureAuthenticated, function(req, res){
	if (req.user.firstName == "")
		res.render('./layouts/Edit_Profile_Student')
	else{
		if(req.user.type == "Instructor")
			res.render('./layouts/TEMPLATE');
		else if (req.user.type == "Student")
			res.render('./layouts/StudentMain');
	}
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

	if(req.user.type == "Instructor")
			res.render('./layouts/ProfileInst');
	else if (req.user.type == "Student")
		res.render('./layouts/Edit_Profile_Student');
})

router.get('/selectCourse/:courseChoice', ensureAuthenticated, function(req,res){
	var courseName = req.params.courseChoice;
	db.collection('userstate').findOne({'email': req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		doc.state = courseName
	    		db.collection('userstate').updateOne({ 'email': doc.email }, {$set : doc}, function(errr, docy) {
	              if (errr) {
	                 console.log(errr);
	               }
	            });
	      	}
	      	else
	      	{
	      		toAdd = {
	      			"email": req.user.email,
	      			'state':  courseName
	      		}
	      		db.collection('userstate').insertOne(toAdd, function(errrr, docc) {
			    	if (errrr) {
			      		console.log(errrr);
			    	}
			  	});
	      	}
	    }
	});
	res.redirect('/users/getResource');
})

router.get('/courses', ensureAuthenticated, function(req,res) {
	res.render('./layouts/courseList');
})

router.get('/assign', ensureAuthenticated, function(req,res) {
	res.render('./layouts/AddAssignDetails');
})

router.get('/gradebook', ensureAuthenticated, function(req,res) {
	res.render('./layouts/gradebook_Instructor');
})


router.get('/assignments', ensureAuthenticated, function(req,res){
	if(req.user.type == "Instructor")
			res.redirect('/users/getassignments');
	else if (req.user.type == "Student")
		res.redirect('/users/getassignments');
})

router.get('/resources', ensureAuthenticated, function(req,res){
	if(req.user.type == "Instructor")
			res.render('./layouts/Resources_Instructor');
	else if (req.user.type == "Student")
		res.render('./layouts/Resources_Student');
})


router.get('/addAssignment', ensureAuthenticated, function(req,res){
	res.render('./layouts/AddAssignDetails');
})

// router.get('/addStudent', ensureAuthenticated, function(req,res){
// 	res.render('./layouts/AddStudent');
// })

router.get('/addStudent', ensureAuthenticated, function(req,res){
	res.render('./layouts/AddStudent');
})
module.exports = router;