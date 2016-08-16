'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Chat = mongoose.model('Chat');

/**
 * Update user details
 */
exports.message = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  var id = req.params.id;

  if (user) {
    // Merge existing user
    User.findOne({_id: id}).exec(function(err, receiver){
        if(err) return res.status(400).send(err);
        if(receiver){
            Chat.find({
              $or: [
                {sendId: receiver._id, receiveId: user._id},
                {receiveId: receiver._id , sendId: user._id}
              ]
            })
            .limit(10)
            .sort({created: -1})
            .exec(function(err, messages){
                if(err) return res.status(400).send(err);
                res.json({
                    receiver: receiver,
                    messages: messages
                });
            });
        } else {
            res.status(400).send({
                message: 'User not found'
            });
        }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
