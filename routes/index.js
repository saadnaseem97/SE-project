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
	res.render('./layouts/ProfileInst');
})

router.get('/Software', ensureAuthenticated, function(req,res){
	if(req.user.type == "Instructor")
			res.render('./layouts/Resources_Instructor');
	else if (req.user.type == "Student")
		res.render('./layouts/Resources_Student');
})

router.get('/courses', ensureAuthenticated, function(req,res) {
	res.render('./layouts/courseList', {
		courses : ["AP", "Software", "Cal"]
	});
})

/*router.get('/getCourse', function(req, res, next){
	var array1 = [];
	var cursor = db.collection('course-data').find();
	cursor.forEach(function(doc,err){
		assert.equal(null,err);
		array1.push(doc);
		console.log(array1);
	}, function(){
		db.close();
		res.render('./layouts/courseList', {items: array1});
	});
})*/

/*router.post('/form-signin', function(req, res, next) {
	var item = {
		name: req.body.courseName 	
	};

	db.collectioon('course-data').insertOne(item, 
		function(err, result) {
			assert.equal(null,err);
			db.close();
		})
})*/

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