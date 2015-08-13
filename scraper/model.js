var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NodeSchema = new Schema({
	songName: {
		type: String,
		unique: true
	},
	artistName: String,
	album: String,
	recLabel: String,
	year: String,
	genre: String,
	imgLink: String,
	songLink: String,
	producers: [String],
	samplesCollection: [{
		songName: String,
		artistName: String,
		album: String,
		recLabel: String,
		year: String,
		genre: String,
		imgLink: String,
		songLink: String,
		// producers: [String],
		sampleElement: {
			sampler: String,
		},
		sampleAppearance: {
			sampler: String,
			original: String
		}
	}]

});

module.exports = mongoose.model('MusicNode', NodeSchema);