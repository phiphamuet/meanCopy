'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket', '$http', '$q', '$state', '$sce',
	function($scope, $location, Authentication, Socket, $http, $q, $state, $sce) {
		// Create a messages array
		$scope.messages = [];
		$scope.listMemberOnline = [];
		$scope.historyMessage = [];
		// If user is not signed in then redirect back home
		if (!Authentication.user) {
			$location.path('/');
		}

		// Make sure the Socket is connected
		if (!Socket.socket) {
			Socket.connect();
		}
		Socket.emit('joinedSuccess');

		// Add an event listener to the 'chatMessage' event
		// Socket.on('chatMessage', function (message) {
		// 	$scope.messages.unshift(message);
		// });
		// Socket.on('joined', function (message) {
		// 	// $scope.messages.unshift(message);
		// 	Socket.emit('joinedSuccess');
		// });
		// Create a controller method for sending messages
		// $scope.sendMessage = function () {
		// 	console.log('send in chat');
		// 	// Create a new message object
		// 	var message = {
		// 		text: this.messageText
		// 	};

		// 	// Emit a 'chatMessage' message event
		// 	Socket.emit('chatMessage', message);

		// 	// Clear the message text
		// 	this.messageText = '';
		// };

		// Remove the event listener when the controller instance is destroyed
		// $scope.$on('$destroy', function () {
		// 	Socket.removeListener('chatMessage');
		// });

		$scope.notMe = function(member) {
				return member._id != user._id;
			}
			//Receive Member
		Socket.on('listMember', function(data) {
			console.log(data);
			$scope.listMemberOnline = data.listMember.filter(function(value, index) {
				var temp = value;
				delete temp.$$hashKey;
				if (temp === window.user) {
					return false;
				}
				for (var i = 0; i < data.listMember.length; i++) {
					if (indexObjectIdOfArray(data.listMember, value) == index) return value;
					else {
						return false;
					}
				}
				return value;
			});
		});

		function indexObjectIdOfArray(array, object) {
			for (var i = 0; i < array.length; i++) {
				if (array[i]._id == object._id) return i;
			}
		}

		//get message history
		$http.get('/api/users/messageHistory')
			.success(function(values) {
				$scope.historyMessage = values;
			})
			.error(function(err) {
				console.log(err)
			})

		//not online
		$scope.notOnline = function(member) {
			var kq = true;
			$scope.listMemberOnline.map(function(value) {
				if (value._id == member._id) kq = false;
			});
			return kq;
		}

		$scope.ctrl = {
			simulateQuery: false,
			isDisabled: false,
			noCache: true,
			// list of `state` value/display objects
			states: function() {},
			selectedItemChange: function(item) {
				$scope.ctrl.searchText = '';
				item && $state.go('chat.private', {
					id: item.value
				})
			},
			searchTextChange: function() {
				return [];
			},
			querySearch: function(value) {
				var defer = $q.defer();
				$http.post('/api/users/find', {
						textSearch: value
					})
					.success(function(values) {
						values = values.map(function(val) {
							return {
								value: val._id,
								display: val.displayName,
								profileImageURL: 'https://' + val.profileImageURL
							}
						})
						defer.resolve(values);
					})
					.error(function(err) {
						console.log(err);
					})
				return defer.promise;
			},
			trustSrc : function(src) {
				return $sce.trustAsResourceUrl(src);
			}
		}


	}
]);