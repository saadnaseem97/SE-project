var express = require('express');
var router = express.Router();

// Get Homepage
// router.get('/', function(req, res){
// 	res.render('./layouts/startPage');
// });
router.get('/', function(req, res, next) {
	if(req.isAuthenticated() && !req.user.isAdmin)
		res.redirect('/dashboard')
  	else
  		res.render('./layouts/instructorLayout', {'errors':null});
});

router.get('/dashboard', ensureAunthenticatedSoc, (req,res,next) => {
	res.render('./layouts/iLogin', {'user': req.user.username})
})

function ensureAunthenticatedAdmin(req,res,next){
	if(req.isAuthenticated() && req.user.isAdmin)
		return next()
	else{
		res.redirect('/')
	}
}
function ensureAunthenticatedSoc(req,res,next){
	if(req.isAuthenticated() && !req.user.isAdmin)
		return next()
	else{
		res.redirect('/')
	}
}

module.exports = router;
// saad