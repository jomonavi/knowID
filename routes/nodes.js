var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

require('../models/nodes');
var MusicNode = mongoose.model('MusicNode');

router.get('/home', function(req, res, next){
	MusicNode.find({}).limit(40).exec(function(err, musicNodes){
		if(err) return next(err);
		console.log(musicNodes);

		res.send(musicNodes);
	});
});

module.exports = router;