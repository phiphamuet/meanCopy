'use strict';

// Configure the 'chat' module routes
angular.module('chat').config(['$stateProvider',
	function ($stateProvider) {
		$stateProvider
			.state('chat', {
				url: '/chat',
				templateUrl: 'modules/chat/client/views/chat.client.view.html',
				data: {
					roles: ['user', 'admin']
				},
				controller: 'ChatController'
			})
			.state('chat.private', {
				url: '/:id',
				templateUrl: 'modules/chat/client/views/chatPrivate.client.view.html',
				data: {
					roles: ['user', 'admin']
				},
				controller: 'ChatPrivateController'
			});
	}
]);
