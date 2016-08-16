/**
 * Created by PHI on 7/24/2016.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	validator = require('validator'),
	generatePassword = require('generate-password'),
	owasp = require('owasp-password-strength-test');

var ChatSchema = new Schema({
	sendId: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	receiveId: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	seen: {
		type: Boolean,
		default: false
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	content: {
		type: String
	}
});

mongoose.model('Chat', ChatSchema);
