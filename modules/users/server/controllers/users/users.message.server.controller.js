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
exports.message = function(req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  var id = req.params.id;
  var limit = req.params.limit || 10;
  var skip = req.params.skip || 0;
  var time = req.query.time;

  if (user) {
    // Merge existing user
    User.findOne({
      _id: id
    }).exec(function(err, receiver) {
      if (err) return res.status(400).send(err);
      if (receiver) {
        var query = {
          $or: [{
            sendId: receiver._id,
            receiveId: user._id
          }, {
            receiveId: receiver._id,
            sendId: user._id
          }]
        }
        if (time) query.created = {
          $lt: new Date(time)
        };
        console.log(query);
        Chat.find(query)
          .limit(limit)
          .skip(skip)
          .sort({
            created: -1
          })
          .exec(function(err, messages) {
            if (err) return res.status(400).send(err);
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

exports.messageHistory = function(req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  var id = req.params.id;
  var limit = req.params.limit || 10;
  var skip = req.params.skip || 0;

  var cursor = Chat.aggregate(
      [{
        $match: {
          sendId: user._id
        }
      }, {
        $group: {
          _id: "$receiveId"
        }
      }, {
        $sort: {
          created: -1
        }
      }, {
        $limit: limit
      }, {
        $skip: skip
      }],
      function(err, values) {
        var query = values.map(function(value) {
          return value._id;
        });
        User.find({
          _id: {
            $in: query
          }
        }).exec(function(err, users) {
          res.json(users);
        });
      }
    )
    // .find({
    //   $or: [
    //     { receiveId: user._id },
    //     { sendId: user._id }
    //   ]
    // })
    // .distinct("sendId")
    // .sort({created: -1})
    // .exec(function (err, value) {
    //   console.log(value);
    //   res.json(value);
    // });
};