'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket', '$http',
	function ($scope, $location, Authentication, Socket, $http) {
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

		$scope.notMe = function(member){
			return member._id != user._id;
		}
		//Receive Member
		Socket.on('listMember', function (data) {
			console.log(data);
			$scope.listMemberOnline = data.listMember.filter(function (value) {
				var temp = value;
				delete temp.$$hashKey;
				if (temp === window.user) {
					return false;
				}
				return value;
			});
		});

		//get message history
		$http.get('/api/users/messageHistory')
		.success(function(values){
			$scope.historyMessage = values;
		})
		.error(function(err){
			console.log(err)
		})

		//not online
		$scope.notOnline = function(member){
			var kq = true;
			$scope.listMemberOnline.map(function(value){
				if(value._id == member._id) kq =false;
			});
			return kq;
		}
	}
]);
