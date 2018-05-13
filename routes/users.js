var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://saadn22:Saad7223@ds131137.mlab.com:31137/tapro');
var db = mongoose.connection;
var assert = require('assert');

var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
    	console.log(file.originalname)
    	file.NewName = Date.now() + file.originalname + makeid();
        cb(null, file.NewName);
    }
});

var upload = multer({ storage: storage }).any();

var User = require('../models/user');

router.post('/addAssignment', upload, (req, res, next) => {
	console.log(req.files[0].NewName)
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		console.log(doc)
				var courseID = doc.state;
				var assignmentName = req.body.AssName;
				var maxMarks = req.body.marks;
				var dueTime = req.body.dueTime;
				var dueDate = req.body.dueDate;
				var year, month, day;
				var timeHours, timeMinutes;
				var a = dueTime.split(':');
				var b = a[Symbol.iterator]();
				timeHours = b.next().value;
				timeMinutes = b.next().value;
				// console.log(timeHours)
				// console.log(timeMinutes)
				// var time=dueDate.slice(12,16);
				// console.log(dueTime)
				var c=dueDate.split('-');
				var e=c[Symbol.iterator]();
				year = e.next().value;
				month = e.next().value; 
				day = e.next().value;
				console.log(month)

				var today = new Date();
				console.log(today.getDate())
				console.log(today.getMonth())
				console.log(today.getFullYear())
				// if (today.getDate() <= day && today.getMonth() <= 9) {
				//   console.log("It's October 3rd.");
				// } else {
				//   console.log("It's not October 3rd.");
				// }
				// console.log(d)
				// if(dueDate>d){
				// 	console.log('okayy to proceed')
				// }
				// console.log(today.getHours())
				// console.log(today.getMinutes())

				if(today.getFullYear() < year){
					console.log('herreee1')
					
					check = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 < month ){
					console.log('herreee2')
					
					check = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() < day){
					console.log('herreee3')
					check = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() < timeHours){
					console.log('herreee4')
					
					check = true;	
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() == timeHours && today.getMinutes() < timeMinutes){
					console.log('herreee5')
					
					check = true;
				}
				else{
					check = false;
				}

				if(check == true){
					id = courseID+assignmentName+makeid()
					toAdd = {
						'key' : req.files[0].NewName,
						'assignmentID': id,
						'course' : courseID,
						'name' : assignmentName,
						'maxMarks' : maxMarks,
						'dueTime' : dueTime,
						'dueDate' : dueDate
					}
					req.checkBody('AssName', 'Assignment name is required').notEmpty();
					req.checkBody('marks', 'Maximum marks are required').notEmpty();
					req.checkBody('dueTime', 'Due time is required').notEmpty();
					req.checkBody('dueDate', 'Due date is required').notEmpty();

					var errors = req.validationErrors();
					console.log(errors)
					if(errors){
						res.render('./layouts/AddAssignDetails',{
							errors:errors
						});
					} 
					else 
					{
						db.collection('assignments').findOne({name: assignmentName}, function(err, doc) {
						    if (err) {
						      console.log(err)
						    } 
						    else 
						    {
						    	if(doc) 
						    	{
						    		req.flash('error_msg', 'Assignment Name already exists');
						    		console.log("REDIRECT DUPLICATE")
									res.render('./layouts/AddAssignDetails');
						      	}
						      	else
						      	{
									db.collection('assignments').insertOne(toAdd, function(errrr, doc) {
								    	if (errrr) 
								    	{
								    		console.log(errrr)
								    	}
								    	else
								    	{
								    		toAdd2 = {
								    			'id': id,
								    			'key':req.files[0].NewName,
								    			'original': req.files[0].originalname

								    		}
								    		db.collection('files').insertOne(toAdd2, function(errr, docc) {
										    	if (errr) 
										    	{
								    				console.log(errr)
										    	}
										    	else
										    	{
										    		req.flash('success_msg', 'Assignment Added');
													res.redirect('/users/getassignments');	
										    	}
										    });
								    	}
								  	});
						      	}
						    }
						});
					}
    			}
    			else{
    				req.flash('error_msg', 'Due Date less than current date');
					res.render('./layouts/AddAssignDetails');
    			}
	    	}
	    }
	});
});

router.get('/getSchedule', function(req, res, next){
	if (req.user.type == 'Instructor')
	{
		console.log("GET?")
		db.collection('schedule').findOne({InstructorEmail:req.user.email}, function(err, tuple) {
			if (err) {
		      console.log(err)
		    }
		    else {
		    	if (tuple) {
		    		var tempArray = tuple.Array
		    		res.render('./layouts/TEMPLATE', {items:tempArray})
		    	}
		    }
		});
	}
});

router.post('/addInSchedule', function(req, res){
	var courseName = req.body.courseName;
	let array = [
		["08:00 - 09:00","-","-","-","-","-","-"],
		["09:00 - 10:00","-","-","-","-","-","-"],
		["10:00 - 11:00","-","-","-","-","-","-"],
		["11:00 - 12:00","-","-","-","-","-","-"],
		["12:00 - 13:00","-","-","-","-","-","-"],
		["13:00 - 14:00","-","-","-","-","-","-"],
		["14:00 - 15:00","-","-","-","-","-","-"],
	]
	//console.log(array)
	//console.log(courseName)
	req.checkBody('courseName', 'courseName is required').notEmpty();

	var day = req.body.day;
	//console.log(day)
	req.checkBody('day', 'Day is required').notEmpty();

	var y = -1;

	if (req.validationErrors()) {
		res.render('./layouts/editSchedule',{
			errors:errors
		});
	} else {
		if (day == "Monday" || day == "monday"){
			y = 1
		}
		if (day == "Tuesday" || day == "tuesday"){
			y = 2
		}
		if (day == "Wednesday" || day == "wednesday"){
			y = 3
		}
		if (day == "Thursday" || day == "thursday"){
			y = 4
		}
		if (day == "Friday" || day == "friday"){
			y = 5
		}
		if (day == "Saturday" || day == "saturday"){
			y = 6
		}
	}

	var x = -1;
	var timeSlot = req.body.timeSlot;
	//console.log(timeSlot)
	req.checkBody('timeSlot', 'TimeSlot is required').notEmpty();

	if (req.validationErrors()) {
		res.render('./layouts/editSchedule',{
			errors:errors
		});
	} else {
		if (timeSlot == "08:00 - 09:00"){
			x = 0
		}
		if (timeSlot == "09:00 - 10:00"){
			x = 1
		}
		if (timeSlot == "10:00 - 11:00"){
			x = 2
		}
		if (timeSlot == "11:00 - 12:00"){
			x = 3
		}
		if (timeSlot == "12:00 - 13:00"){
			x = 4
		}
		if (timeSlot == "13:00 - 14:00"){
			x = 5
		}
		if (timeSlot == "14:00 - 15:00"){
			x = 6
		}
	}


	var errors = req.validationErrors();

	if(errors){
		res.render('./layouts/editSchedule',{
			errors:errors
		});
	} else {
		db.collection('schedule').findOne({InstructorEmail:req.user.email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } 
		    else 
		    {
		    	if(doc) 
		    	{
		    		//console.log("Not Found!")
		      		db.collection('schedule').findOne({InstructorEmail:req.user.email}, function(err, tuple) {
		      			if (err) {
		      				console.log(err)
		      			}
		      			else {
		      				//console.log("works?")
		      				
		      				var tempArray = tuple.Array
		      				//console.log(tempArray)
		      				tempArray[x][y] = courseName
		      				toAdd = {
								Array : tempArray,
								InstructorEmail : req.user.email
							}

							db.collection('schedule').remove({InstructorEmail:req.user.email}, function(err, tuple) {
				      			if (err) {
				      				console.log(err)
				      			}
				      			else {
				      				console.log("Old tuple Removed!")
				      				db.collection('schedule').insertOne(toAdd, function(err, doc) {
							        	if (err) {
							          		handleError(res, err.message, "Failed add to file DB.");
							        	}
							        	else{
							        		req.flash('success_msg', 'Schedule Updated!');
									   		res.render('./layouts/TEMPLATE');
							        	}
							      	});
								}
							})
		      			}
		      		})
		      	}
		      	else
		      	{
		      		console.log("Found!")
					array[x][y] = courseName
					toAdd = {
						Array : array,
						InstructorEmail : req.user.email
					}
					db.collection('schedule').insertOne(toAdd, function(err, doc) {
			        	if (err) {
			          		handleError(res, err.message, "Failed add to file DB.");
			        	}
			        	else{
			        		req.flash('success_msg', 'Schedule Updated!');
					   		res.render('./layouts/TEMPLATE');
			        	}
			      	});
		      	}
		    }
		});
	}
});

router.post('/addResource', upload, (req, res, next) => {
	console.log("Add Resource Called")
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		console.log(req.files)
	    		console.log(doc)
				var courseID = doc.state;
				var resourceName = req.files[0].originalname;
				var date = new Date();
				id = courseID+resourceName+makeid()
				toAdd = {
					'key' : req.files[0].NewName,
					'resourceID': id,
					'course' : courseID,
					'name' : resourceName,
					'date' : `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
				}
				db.collection('resources').insertOne(toAdd, function(err, doc) {
			    	if (err) 
			    	{
			    		console.log(err)
			    	}
			    	else
			    	{
			    		toAdd2 = {
			    			'id': id,
			    			'key':req.files[0].NewName,
			    			'original': req.files[0].originalname

			    		}
			    		db.collection('files').insertOne(toAdd2, function(errr, docc) {
					    	if (errr) 
					    	{
			    				console.log(errr)
					    	}
					    	else
					    	{
					    		req.flash('success_msg', 'Resource Added');
								res.redirect('/users/getResource');	
					    	}
					    });
			    	}
			  	});
	    	}
	    }
	});
});


//Download a File
router.get('/download/:fileid', function(req, res){
	var fileid = req.params.fileid;
	console.log(fileid)
	db.collection('files').findOne({id: fileid}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		originalname = doc.original;
	    		fileKey = doc.key;
	    		console.log('Download file')
				res.download(  './public/uploads/' + fileKey , originalname)
	    	}
	    }
	});
});

// Register
router.get('/register', function(req, res){
	res.render('./layouts/SignInSignUp');
});

// Login
router.get('/login', function(req, res){
	res.render('./layouts/SignInSignUp');
});

router.get('/getCourse', function(req, res, next){
	if (req.user.type == 'Instructor')
	{
		var array1 = [];
		var cursor = db.collection('courses').find({InstructorEmail:req.user.email});
		cursor.forEach(function(doc,err){
			assert.equal(null,err);
			array1.push(doc);
			//console.log(array1);
		}, function(){
			//db.close();
			res.render('./layouts/courseList', {items: array1});
			//console.log("Done?");
		});
	}
	else{
		db.collection('users').findOne({email: req.user.email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } 
		    else 
		    {
		    	if(doc) 
		    	{
		    		var array1 = [];
		    		var f = doc.Courses.length
		    		doc.Courses.forEach(function(x,e){
		    			console.log(x)
						db.collection('courses').findOne({CourseID:x}, function(errr,docc) {
							if (errr)
							{
								console.log(errr)
							}
							if (docc)
							{
								array1.push(docc)
								if ((--f) == 0) {
						    		res.render('./layouts/courseList', {items: array1});							
				    			}
							}
						});
		    		});
		    		// console.log(array1)
		    		// res.render('./layouts/courseList', {items: array1});
		    	}
		    }
		});
	}
	//console.log("Out?");
});

router.get('/getassignments', function(req, res, next){
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
				var courseID = doc.state;
				var array1 = [];
				var cursor = db.collection('assignments').find({course:courseID});
				cursor.forEach(function(doc,err){
					assert.equal(null,err);
					array1.push(doc);
				}, function(){
					if(req.user.type == "Instructor")
						res.render('./layouts/Assignment_Instructor', {items: array1});
					else if (req.user.type == "Student")
						res.render('./layouts/Assignment_Student', {items: array1});
				});
	    	}
	    }
	});
});

router.get('/getassignmentsGB', function(req, res, next){
	db.collection('userstate').findOne({email: req.user.email}, function(err, docc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(docc) 
	    	{
				var courseID = docc.state;
				var array1 = [];
				db.collection('assignments').find({course:courseID},(err,data) => {
					data.forEach(function(doc,err){
						assert.equal(null,err);

						var dueTime = doc.dueTime;
						var dueDate = doc.dueDate;
						var year, month, day;
						var timeHours, timeMinutes;
						var a = dueTime.split(':');
						var b = a[Symbol.iterator]();
						timeHours = b.next().value;
						timeMinutes = b.next().value;
						// console.log(timeHours)
						// console.log(timeMinutes)
						// var time=dueDate.slice(12,16);
						// console.log(dueTime)
						var c=dueDate.split('-');
						var e=c[Symbol.iterator]();
						year = e.next().value;
						month = e.next().value; 
						day = e.next().value;
						// console.log(month)

						var today = new Date();
						// console.log(today.getDate())
						// console.log(today.getMonth())
						// console.log(today.getFullYear())

						if(today.getFullYear() < year){
						console.log('herreee1')	
						checkNew = true;
						}
						else if(today.getFullYear() == year && today.getMonth()+1 < month ){
							console.log('herreee2')
							
							checkNew = true;
						}
						else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() < day){
							console.log('herreee3')
							checkNew = true;
						}
						else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() < timeHours){
							console.log('herreee4')
							
							checkNew = true;	
						}
						else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() == timeHours && today.getMinutes() < timeMinutes){
							console.log('herreee5')
							
							checkNew = true;
						}
						else{
							checkNew = false;
						}
						if(checkNew == true) // Valid
						{
							array1.push(doc);
						}
					}, function(){
						console.log(array1)
						if(req.user.type == "Instructor")
							res.render('./layouts/gradebook_Instructor', {items: array1});
						else if (req.user.type == "Student")
							res.render('./layouts/gradebook_Instructor', {items: array1});
					});
				});
	    	}
	    }
	});
});

router.get('/getResource', function(req, res, next){
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
				var courseID = doc.state;
				var array1 = [];
				var cursor = db.collection('resources').find({course:courseID});
				cursor.forEach(function(doc,err){
					assert.equal(null,err);
					array1.push(doc);
				}, function(){
					console.log(array1)
					if(req.user.type == "Instructor")
						res.render('./layouts/Resources_Instructor', {items: array1});
					else if (req.user.type == "Student")
						res.render('./layouts/Resources_Student', {items: array1});
				});
	    	}
	    }
	});
});

router.post('/addCourse', function(req, res){
	var courseName = req.body.courseName;
	console.log(courseName)
	req.checkBody('courseName', 'courseName is required').notEmpty();

	var errors = req.validationErrors();
	console.log(errors)
	//console.log("good")
	if(errors){
		res.render('./layouts/courseList',{
			errors:errors
		});
	} else {
		console.log(courseName)
		console.log(req.user.email)
		db.collection('courses').findOne({Course: courseName , InstructorEmail:req.user.email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } 
		    else 
		    {
		    	if(doc) 
		    	{
		    		req.flash('error_msg', 'Course Name already exists');
					res.redirect('/courses');
		      	}
		      	else
		      	{
		      		id = courseName+ makeid();
					toAdd = {
						CourseID: id,
						Course : courseName,
						InstructorEmail : req.user.email,
						Students:[]
					}
					db.collection('courses').insertOne(toAdd, function(err, doc) {
			        	if (err) {
			          		handleError(res, err.message, "Failed add to file DB.");
			        	}
			        	else{
			        		req.flash('success_msg', 'Course Added');
					   		res.redirect('/courses');
			        	}
			      	});
		      	}
		    }
		});
	}
});

// Register User
router.post('/register', function(req, res){

	let array = [
		["08:00 - 09:00","-","-","-","-","-","-"],
		["09:00 - 10:00","-","-","-","-","-","-"],
		["10:00 - 11:00","-","-","-","-","-","-"],
		["11:00 - 12:00","-","-","-","-","-","-"],
		["12:00 - 13:00","-","-","-","-","-","-"],
		["13:00 - 14:00","-","-","-","-","-","-"],
		["14:00 - 15:00","-","-","-","-","-","-"],
	]

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

					toAdd = {
								Array : array,
								InstructorEmail : email
							}

					db.collection('schedule').insertOne(toAdd, function(err, doc) {
			        	if (err) {
			          		handleError(res, err.message, "Failed add to file DB.");
			        	}
			      	});

					req.flash('success_msg', 'You are registered and can now login');
					console.log('flash message')
					res.redirect('/users/login');
		      	}
		    }
		});
	}
});
router.post('/editInstProf', function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	// var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var ContactNumber = req.body.ContactNumber;

	// console.log(req.body)

	// Validation
	req.checkBody('firstName', 'First Name is required').notEmpty();
	req.checkBody('lastName', 'Last Name is required').notEmpty();
	req.checkBody('ContactNumber', 'Contact Number is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Passwords do not match').equals(req.body.password2);


	var errors = req.validationErrors();
	console.log(errors)
	if(errors){
		res.render('./layouts/ProfileInst',{
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
		db.collection('users').findOne({email: req.user.email}, function(err, doc) {
		    if (err) {
		      console.log(err)
		    } else {
		    	if(doc) {
		    		var email = doc.email;
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

		    		db.collection('users').remove({email: email})
		    		User.createUser(newUser, function(err, user){
						if(err) throw err;
						console.log(user);
					});
		    		req.flash('success_msg', 'Edit Profile Successful');
					console.log('flash message')
					res.redirect('/');
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
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc)
	    	{
				var courseID = doc.state;
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
					    		if (doc.Courses.includes(courseID))
					    		{
						    		console.log("ERROR IN ADD STUDENT")
						    		req.flash('error_msg', 'Email already exists in this course');
									res.redirect('/addStudent');
					    		}
					    		else
					    		{
					    			doc.Courses.push(courseID)
					    			db.collection('users').updateOne({ 'email': email }, {$set : doc}, function(errr, docy) {
							          if (errr) {
							             console.log(errr);
							           }
								        db.collection('courses').findOne({CourseID: courseID}, function(err, docc) {
										    if (err) {
										      console.log(err)
										    } else {
										    	if(docc) {
										    		docc.Students.push(email);
										    		db.collection('courses').updateOne({ CourseID: courseID }, {$set : docc}, function(errr, docy) {
											          if (errr) {
											             console.log(errr);
											           }
											           console.log("ADDED ")
														req.flash('success_msg', 'Added User');	
														console.log('flash message')
														res.redirect('/addStudent');
											        });
										    	}
										    }
										});
							        });

					    		}
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
									ParentContact: "",
									Courses: [courseID]
								});
								User.createUser(newUser, function(err, user){
									if(err) throw err;
									console.log(user);
								});

								db.collection('courses').findOne({CourseID: courseID}, function(err, docc) {
								    if (err) {
								      console.log(err)
								    } else {
								    	if(docc) {
								    		docc.Students.push(email);
									    	db.collection('courses').updateOne({ CourseID: courseID }, {$set : docc}, function(errr, docy) {
									          	if (errr) {
									            	console.log(errr);
									           }
									        	console.log("ADDED ")
												req.flash('success_msg', 'Added User');	
												console.log('flash message')
												res.redirect('/addStudent');
									        });
								    	}
								    }
								});
					      	}
					    }
					});
				}
	    	}
	    }
	});
});

router.get('/selectAssignGB/:assignID', function(req, res){
	var assignID = req.params.assignID;

	db.collection('submissions').find({assignmentID: assignID}, function(err, doccc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	array1 = []
	    	var f=0
	    	// console.log(`IM HEREEEE ${f}`)
	    	doccc.forEach((doc,err) => {
				f++
	    		db.collection('users').findOne({email: doc.email}, function(err, docc) {
				    if (err) {
				      console.log(err);
				    } 
				    else
				    {
				    	if (doc)
				    	{

				    		db.collection('marks').findOne({StudentEmail: doc.email, assignmentID:assignID}, function(err, doc2) {
							    if (err) {
							      console.log(err);
							    } 
							    else
							    {
							    	if (doc2)
							    	{
							    		docc.marks = doc2.mark;
								    	docc.assignmentID = doc.assignmentID;
								    	docc.key = doc.key;
										array1.push(docc);
										console.log(f)
										if (--f==0)  
										{
											console.log("WEEEE")
											console.log()
											if(req.user.type == "Instructor")
												res.render('./layouts/gradebook_instr_displ', {items: array1});
											else if (req.user.type == "Student")
												res.render('./layouts/gradebook_instr_displ', {items: array1});
								    	}
							    	}
							    	else{
							    		docc.assignmentID = doc.assignmentID;
								    	docc.key = doc.key;
										array1.push(docc);
							    		if(--f==0) {
											console.log("WEEEE")
											if(req.user.type == "Instructor")
												res.render('./layouts/gradebook_instr_displ', {items: array1});
											else if (req.user.type == "Student")
												res.render('./layouts/gradebook_instr_displ', {items: array1});

							    		}
							    	}
							    }
							});







				    	}
				    	else{
				    		if(--f==0) {
								console.log("WEEEE")
								if(req.user.type == "Instructor")
									res.render('./layouts/gradebook_instr_displ', {items: array1});
								else if (req.user.type == "Student")
									res.render('./layouts/gradebook_instr_displ', {items: array1});

				    		}
				    	}
					}
				});
			});
	    }
	});
});

router.get('/addMarks/:assignmentID/:email',function(req,res){
	var assignID = req.params.assignmentID;
	var Semail = req.params.email;
	res.render('./layouts/addMarks', {AID:assignID ,student:Semail})
});

router.post('/addMarksFin/:assignmentID/:email',function(req,res){
	var assignID = req.params.assignmentID;
	var Semail = req.params.email;
	var marks = req.body.marks;
	toAdd = {
		assignmentID: assignID,
		StudentEmail: Semail,
		mark: marks
	}
	db.collection('marks').insertOne(toAdd, function(errrr, doc) {
    	if (errrr) 
    	{
    		console.log(errrr)
    	}
    	else
    	{
			res.redirect('/users/selectAssignGB/'+assignID)
    	}
    });
});

router.get('/selectAssignment/:assignID', function(req, res){
	var assignID = req.params.assignID;

	db.collection('assignments').findOne({assignmentID: assignID}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		var dueTime = doc.dueTime;
				var dueDate = doc.dueDate;
				var year, month, day;
				var timeHours, timeMinutes;
				var a = dueTime.split(':');
				var b = a[Symbol.iterator]();
				timeHours = b.next().value;
				timeMinutes = b.next().value;
				// console.log(timeHours)
				// console.log(timeMinutes)
				// var time=dueDate.slice(12,16);
				// console.log(dueTime)
				var c=dueDate.split('-');
				var e=c[Symbol.iterator]();
				year = e.next().value;
				month = e.next().value; 
				day = e.next().value;
				// console.log(month)

				var today = new Date();
				// console.log(today.getDate())
				// console.log(today.getMonth())
				// console.log(today.getFullYear())

				if(today.getFullYear() < year){
				console.log('herreee1')	
				checkNew = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 < month ){
					console.log('herreee2')
					
					checkNew = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() < day){
					console.log('herreee3')
					checkNew = true;
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() < timeHours){
					console.log('herreee4')
					
					checkNew = true;	
				}
				else if(today.getFullYear() == year && today.getMonth()+1 == month && today.getDate() == day && today.getHours() == timeHours && today.getMinutes() < timeMinutes){
					console.log('herreee5')
					
					checkNew = true;
				}
				else{
					checkNew = false;
				}
			}
			if(checkNew == true)
			{
				if (req.user.type == 'Student')
				{
					res.render('./layouts/StudentSubmission', {AID:assignID,Adate:dueDate,Atime:dueTime})
				}
			}
			else // Time passed
			{
				if (req.user.type == 'Student')
				{
					db.collection('comments').findOne({assignmentID: assignID, email:req.user.email}, function(err, doc) {
					    if (err) {
					      console.log(err);
					    }
					    else
					    {
					    	comment = 'No Comment';
					    	if(doc)
					    	{
					    		comment = doc.comment;
					    		console.log(assignID)
					    		res.render('./layouts/StudentCommentView', {AID:assignID,Adate:dueDate,Atime:dueTime, Acomment: comment});
					    	}
					    	else{
					    		console.log(assignID)
								res.render('./layouts/StudentCommentView', {AID:assignID,Adate:dueDate,Atime:dueTime, Acomment: comment});
					    	}
					    }
					});
				}
				else{
					db.collection('userstate').findOne({email: req.user.email}, function(err, docc) {
					    if (err) {
					      console.log(err);
					    } 
					    else
					    {
					    	if(docc) 
					    	{
								var courseID = docc.state;
								db.collection('courses').findOne({CourseID: courseID}, function(err, doccc) {
								    if (err) {
								      console.log(err);
								    } 
								    else
								    {
								    	if(doccc) 
								    	{
								    		array1 = []
								    		var f = doccc.Students.length
								    		doccc.Students.forEach(x=> {
								    			db.collection('users').findOne({email: x}, (err,data) => {
								    				data.AID = assignID;
								    				array1.push(data)
								    				console.log(assignID)
								    				--f || res.render('./layouts/Assignment_inst_closed',{roster: array1})
								    			})
								    		})
								    	}
								    }
								});
							}
						}
					});
				}
			}
    	}
	})
});

router.get('/getRoster', function(req, res){
	db.collection('userstate').findOne({email: req.user.email}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
				var courseID = doc.state;
				db.collection('courses').findOne({CourseID: courseID}, function(err, docc) {
			    if (err) {
				      console.log(err);
				    } 
				    else
				    {
				    	if(docc) 
				    	{
				    		array1 = []
				    		var f = docc.Students.length
				    		docc.Students.forEach(x=> {
				    			db.collection('users').findOne({email: x}, (err,data) => {
				    				array1.push(data)
				    				--f || res.render('./layouts/Roster',{roster: array1})
				    			})
				    		})
				    	}
				    }
				});
			}
		}
	});
});


router.get('/viewStudSub/:AID/:email', function(req, res){
	var assignID = req.params.AID;
	var sEmail = req.params.email;
	db.collection('users').findOne({email: sEmail}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		lastName = doc.lastName;

	    		db.collection('assignments').findOne({assignmentID: assignID}, function(errr, docc) {
				    if (errr) {
				      console.log(errr);
				    } 
				    else
				    {
				    	if(docc) 
				    	{
				    		date = docc.dueDate;
				    		time = docc.dueTime;
				    		db.collection('comments').findOne({assignmentID: assignID, email:sEmail}, function(err, doccc) {
							    if (err) {
							      console.log(err);
							    }
							    else
							    {
							    	console.log(doccc)
							    	if(doccc)
							    	{
										res.render('./layouts/StudentCommentView' , {AID:assignID,Adate:date,Atime:time, Acomment: doccc.comment})
							    	}
							    	else{
										res.render('./layouts/Instr_Comment', {AID:assignID, Lname : lastName, Adate : date, Atime:time, Semail:sEmail})
							    	}
							    }
							});
				    	}
				    }
				});
	    	}
	    }
	});
});

router.get('/downloadSubmission/:AID/:email', function(req, res){
	var assignID = req.params.AID;
	var sEmail = req.params.email;
	db.collection('submissions').findOne({assignmentID: AID, email:sEmail}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		originalname = doc.original;
	    		fileKey = doc.key;
	    		console.log('Download file')
				res.download(  './public/uploads/' + fileKey , originalname)
	    	}
	    }
	});
});

router.get('/downloadsubmission/:AID', function(req, res){
	var AID = req.params.AID;
	console.log(AID)
	db.collection('submissions').findOne({assignmentID: AID}, function(err, doc) {
	    if (err) {
	      console.log(err);
	    } 
	    else
	    {
	    	if(doc) 
	    	{
	    		originalname = doc.original;
	    		fileKey = doc.key;
	    		console.log('Download file')
				res.download(  './public/uploads/' + fileKey , originalname)
	    	}
	    }
	});
});

router.post('/addComment/:AID/:email', upload , function(req, res,next){
	var assignID = req.params.AID;
	var sEmail = req.params.email;
	var comm = req.body.comment;
	toAdd = {
		assignmentID: assignID,
		email: sEmail,
    	comment : comm
	}
	db.collection('comments').insertOne(toAdd, function(errrr, doc) {
    	if (errrr) 
    	{
    		console.log(errrr)
    	}
    	else
    	{
    		db.collection('assignments').findOne({assignmentID: assignID}, function(errr, docc) {
			    if (errr) {
			      console.log(errr);
			    } 
			    else
			    {
			    	if(docc) 
			    	{
			    		date = docc.dueDate;
			    		time = docc.dueTime;
						res.render('./layouts/StudentCommentView' , {AID:assignID,Adate:date,Atime:time, Acomment: comm})
			    	}
			    }
			});
			
    	}
    });

});

router.post('/submitAssignment/:assignID', upload , function(req, res,next){
	var assignID = req.params.assignID;
	toAdd = {
		assignmentID: assignID,
		email: req.user.email,
    	key : req.files[0].NewName,
    	original : req.files[0].originalname
	}
	db.collection('submissions').insertOne(toAdd, function(errrr, doc) {
    	if (errrr) 
    	{
    		console.log(errrr)
    	}
    	else
    	{
			toAdd2 = {
				'key':req.files[0].NewName,
				'original': req.files[0].originalname
			}
			db.collection('files').insertOne(toAdd2, function(errr, docc) {
				if (errr) 
				{
					console.log(errr)
				}
				else
				{
					req.flash('success_msg', 'Assignment Submitted');
					res.redirect('/users/getassignments');	
				}
			});
    		console.log('AssignmentSubmitted')
    	}
    });

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


function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 12; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}