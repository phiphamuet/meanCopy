/**
 * Created by PHI on 7/24/2016.
 */
'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatPrivateController', ['$scope', '$location', 'Authentication', 'Socket', '$state', '$http', '$timeout',
	function($scope, $location, Authentication, Socket, $state, $http, $timeout) {
		$scope.receiver;
		// Create a messages array
		$scope.messages = [];
		$scope.listMember = [];
		$http.get('/api/users/message/' + $state.params.id)
			.success(function(value) {
				$scope.receiver = value.receiver;
				value.messages.forEach(function(message) {
					var mess = {
						text: message.content,
						username: (message.sendId == $scope.receiver._id) ? $scope.receiver.username : user.username,
						profileImageURL: (message.sendId == $scope.receiver._id) ? $scope.receiver.profileImageURL : user.profileImageURL,
						created: message.created,
						sender: message.sendId,
						receiver: message.receiveId
					}
					$scope.messages.unshift(mess);
					$timeout(
						function() {
							document.querySelector("ul.messageContainer").scrollTop = document.querySelector("ul.messageContainer li:last-child").offsetTop
						});
				});
			})
			.error(function(err) {
				console.log(err)
			})

		$scope.notMe = function(value) {
			return value != user._id;
		}


		// If user is not signed in then redirect back home
		if (!Authentication.user) {
			$location.path('/');
		}

		// Make sure the Socket is connected
		if (!Socket.socket) {
			Socket.connect();
		}

		// Add an event listener to the 'chatMessage' event
		Socket.on('privateMessage', function(message) {

			$scope.messages.push(message);
			// $("ul.messageContainer").scrollTop = $("ul.messageContainer li:last-child").offsetTop;
		});
		// Private message
		Socket.on('chatMessage', function(message) {
			if (message.type == "message") {
				if (
					(message.receiver == user._id && message.sender == $state.params.id) ||
					(message.sender == user._id && message.receiver == $state.params.id)
				)
					$scope.messages.push(message);
				$timeout(function() {
					document.querySelector("ul.messageContainer").scrollTop = document.querySelector("ul.messageContainer li:last-child").offsetTop
				});
			} else {
				$scope.messages.push(message);
			}

		});
		Socket.on('joined', function(message) {
			// $scope.messages.unshift(message);
			Socket.emit('joinedSuccess');
		});
		// Create a controller method for sending messages
		$scope.sendMessage = function() {
			// Create a new message object
			var message = {
				text: this.messageText
			};
			if ($state.params.id) {
				message.receiver = $state.params.id;
			}
			// Emit a 'chatMessage' message event
			Socket.emit('privateMessage', message);

			// Clear the message text
			this.messageText = '';
		};

		$scope.loadMessage = function() {
			if ($scope.busy) return;
			$scope.busy = true;

			var time = $scope.messages[0].created;
			$http({
					url: '/api/users/message/' + $state.params.id,
					method: 'get',
					params: {
						time: time
					}
				})
				.success(function(value) {
					console.log(value);
					$scope.receiver = value.receiver;
					value.messages.forEach(function(message) {
						var mess = {
							text: message.content,
							username: (message.sendId == $scope.receiver._id) ? $scope.receiver.username : user.username,
							profileImageURL: (message.sendId == $scope.receiver._id) ? $scope.receiver.profileImageURL : user.profileImageURL,
							created: message.created,
							sender: message.sendId,
							receiver: message.receiveId
						}
						$scope.messages.unshift(mess);
						$timeout(
							function() {
								document.querySelector("ul.messageContainer").scrollTop = document.querySelector("ul.messageContainer li:nth-child(10)").offsetTop
							});
						$timeout(function() {
							$scope.busy = false;
						}, 1000);
					});
				})
				.error(function(err) {
					$scope.busy = false;
					console.log(err)
				})

			// alert('loaded');
		}

		// $timeout(function(){
		// 	$scope.listener = $scope.$watch(function(){
		// 		return document.querySelector("ul.messageContainer").scrollTop < document.querySelector("ul.messageContainer li:first-child").offsetHeight
		// 	}, function(){
		// 		$scope.x = document.querySelector("ul.messageContainer").scrollTop;
		// 	})
		// })
		// Remove the event listener when the controller instance is destroyed
		// $scope.$on('$destroy', function () {
		// 	Socket.removeListener('chatMessage');
		// });

		//Receive Member
		// Socket.on('listMember', function (data) {
		// 	console.log(data);
		// 	$scope.listMember = data.listMember.filter(function (value) {
		// 		var temp = value;
		// 		delete temp.$$hashKey;
		// 		if (temp === window.user) {
		// 			return false;
		// 		}
		// 		return value;
		// 	});
		// });

	}
]);
angular.module('chat').directive('loadMessage', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var raw = element[0];
			// console.log('loading directive');

			element.bind('scroll', function() {
				// console.log('in scroll');
				// console.log(raw.scrollTop); //+ raw.offsetHeight);
				// console.log(raw.scrollHeight);
				//if (raw.scrollTop + raw.offsetHeight > raw.scrollHeight) {
				if (raw.scrollTop < 10) {
					scope.$apply(attrs.scrolly);
				}
			});
		}
	};
})