const { Schema, model } = require('mongoose');

/**
 * @typedef {Object} UserObject
 */

/**
 * @typedef {MongooseDocument & UserObject} UserDocument
 */

const userSchema = new Schema({
}, { timestamps: true });

module.exports = model('user', userSchema);
