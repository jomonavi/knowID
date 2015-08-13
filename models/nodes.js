var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NodeSchema = new Schema({
	songName: String,
	artistName: String,
	album: String,
	ft: [String],
	recLabel: String,
	year: String,
	genre: String,
	imgLink: String,
	songLink: String,
	producers: [String],
	sampleElement: String,
	samplesCollection: [{
		originalSong: String,
		originalArtist: String,
		originalAlbum: String,
		recLabel: String,
		genre: String,
		year: String,
		songLink: String,
		imgLink: String,
		sampleAppearance: {
			sampler: String,
			original: String
		}
	}]

});

module.exports = mongoose.model('MusicNode', NodeSchema);