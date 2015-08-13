var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/samples';
mongoose.connect(dbUrl);

require('../models/nodes');

// Close the Mongoose connection on Control+C
process.on('SIGINT', function() {
  	mongoose.connection.close(function () {
    	console.log('Mongoose default connection disconnected');
    	process.exit(0);
	}); 
});
