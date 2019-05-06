const { Schema, model } = require('mongoose');

/**
 * @typedef {Object} UserObject
 * @property {String} username
 * @property {String} email
 * @property {String} twitchId
 * @property {String} googleId
 * @property {String} avatar
 * @property {String} youtube
 * @property {String} facebook
 * @property {String} peerplaysAccountName
 * @property {String} bitcoinAddress
 */

/**
 * @typedef {MongooseDocument & UserObject} UserDocument
 */

const userSchema = new Schema({
	username: {
		type: String,
	},
	email: {
		type: String,
	},
	avatar: {
		type: String,
	},
	twitchId: {
		type: String,
		index: true,
		unique: true,
		sparse: true,
	},
	googleId: {
		type: String,
		index: true,
		unique: true,
		sparse: true,
	},
	facebookId: {
		type: String,
		index: true,
		unique: true,
		sparse: true,
	},
	youtube: {
		type: String,
		default: '',
	},
	facebook: {
		type: String,
		default: '',
	},
	peerplaysAccountName: {
		type: String,
		default: '',
	},
	bitcoinAddress: {
		type: String,
		default: '',
	},
}, { timestamps: true });

module.exports = model('user', userSchema);
