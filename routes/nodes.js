var express = require('express');
var mongoose = require('mongoose');
var rp = require('request-promise');
var mockData = require('../mockdata');

var router = express.Router();

router.post('/home', function(req, res, next){
	var artist = req.body.artist;
	var page = req.body.page;
	console.log(req.body);
	var url = "https://samples-api.herokuapp.com/" + artist + "/" + page;
	
	var options = {
		uri: url,
		json: true
	}

	rp(options)
		.then(function(data){
			res.send(data);
		}, function(error){
			res.status(500).send(error);
		});
});


module.exports = router;