const { Schema, model } = require('mongoose');

/**
 * @typedef {Object} UserObject
 * @property {String} twitchUsername
 * @property {String} twitchId
 * @property {String} youtube
 * @property {String} facebook
 * @property {String} peerplaysAccountName
 * @property {String} bitcoinAddress
 */

/**
 * @typedef {MongooseDocument & UserObject} UserDocument
 */

const userSchema = new Schema({
	twitchUsername: {
		type: String,
		required: true,
	},
	twitchId: {
		type: String,
		required: true,
		index: true,
		unique: true,
	},
	twitchEmail: {
		type: String,
		required: true,
		index: true,
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
