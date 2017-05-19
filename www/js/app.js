var app = angular.module('cetApp', ['ionic', 'ionic-material', 'ion-floating-menu', 'firebase', 'angular-loading-bar', 'ngAnimate', 'ionic-toast']);
var addressHost = 'https://blooming-reaches-58473.herokuapp.com/';
//var addressHost = 'http://localhost:3000/';
var socket; //$socket below
app.factory('$validateLogin', function($rootScope, $state) {

    return function() {
        if (!localStorage.getItem('loggedIn')) {
            $state.go('login');
        } else {
            $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            console.log("sub channel: " + $rootScope.currentUser.subChannels);
        }
    }

});
app.factory('$packingService', function($rootScope) {

    return {

        storeUser: function() {
            var user = $rootScope.currentUser;
            var pack = {
                'userId': user.userId,
                'name': user.name,
                'department': user.department,
                'post': user.post,
                'adminOf': user.adminOf,
                'subChannels': user.subChannels,
                'userToken': user.userToken
            }

            var packedUser = JSON.stringify(pack);
            sessionStorage.setItem('currentUser', packedUser);
            return;
        },

        packUser: function packUser(user) {
            var pack = {
                'userToken': user.userToken,
                'userId': user.userId,
                'name': user.name,
                'department': user.department,
                'post': user.post,
                'adminOf': user.adminOf,
                'subChannels': user.subChannels
            }
            console.log('packed');
            return JSON.stringify(pack);
        }

    }
});
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 0; //latencyThreshold for wait for http

}]);

app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html"
    })

    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'loginCtrl'
    })

    .state('app.broadcast', {
            url: "/broadcast",
            views: {
                'menuContent': {
                    templateUrl: "templates/broadcast.html",
                    controller: 'broadcastCtrl'
                }
            }
        })
        .state('app.broadcastView', {
            url: "/broadcastView",
            views: {
                'menuContent': {
                    templateUrl: "templates/broadcastView.html",
                    controller: 'broadcastViewCtrl'
                }
            }
        })
        .state('app.channels', {
            url: "/channels",
            views: {
                'menuContent': {
                    templateUrl: "templates/channels.html",
                    controller: 'channelCtrl'
                }
            }
        })
        .state('app.sendBroadcast', {
            url: "/sendBroadcast",
            views: {
                'menuContent': {
                    templateUrl: "templates/sendBroadcast.html",
                    controller: 'bformController'
                }
            }
        })
        .state('app.incomingRequests', {
            url: "/incomingRequests",
            views: {
                'menuContent': {
                    templateUrl: "templates/incomingRequests.html",
                    controller: 'incomingRequestsCtrl'
                }
            }
        })
        .state('app.inbox', {
            url: "/inbox",
            views: {
                'menuContent': {
                    templateUrl: "templates/inbox.html",
                    controller: 'inboxController'
                }
            }
        })

    .state('app.sentItems', {
            url: "/sentItems",
            views: {
                'menuContent': {
                    templateUrl: "templates/sentItems.html",
                    controller: 'sentItemsController'
                }
            }
        })
        .state('app.compose', {
            url: "/compose",
            views: {
                'menuContent': {
                    templateUrl: "templates/compose.html",
                    controller: 'composeCtrl'
                }
            }
        })


    .state('app.profile', {
        url: "/profile",
        views: {
            'menuContent': {
                templateUrl: "templates/profile.html",
                controller: 'profileCtrl'
            }
        }
    });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});

app.controller('settingsCtrl', function() {

});