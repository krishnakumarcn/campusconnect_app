//var channels_for_view = [{name:'All',subbed:false},{name:'CSE',subbed:true},{name:'IEEE',subbed:false},{name:'Robocet',subbed:true}];
var channels_for_view = [];
var header = '[channelsController]';
var channelListURI = 'channelList/';



app.controller('channelCtrl', function($scope, $rootScope, $http, $validateLogin, $packingService, $http, ionicToast) {
    $validateLogin();
    //uncomment to load from firebase
    //var channelListRef = firebase.database().ref(channelListURI).orderByChild('channelName');
    //var firebase_channels = $firebaseArray(channelListRef);
    $scope.channelWait = true;
    var firebase_channels;
    $http.get(addressHost + 'channel/getChannels').then(function(res) {
        $scope.channelWait = false;
        firebase_channels = JSON.parse(res.data.channels);
        $scope.channels_for_view = firebase_channels;
        console.log(firebase_channels);
        setToggles(userChannels, firebase_channels);
    }).catch(function(err) {
        scope.channelWait = false;
        ionicToast.show('Error Loading Channels, try reloading', 'bottom', false, 2500);
    });

    var userChannels = $rootScope.currentUser.subChannels;


    $scope.subChanged = function(channelName, status) {
        var payload = packagePayload(channelName, status, $rootScope.currentUser.userToken);
        console.log(payload);
        $http.post(addressHost + "channel/subunsub", { payload: payload })
            .then(function(res) {
                if (res.status == 200) {
                    if (status) {
                        $rootScope.currentUser.subChannels.push(channelName);
                        ionicToast.show('Success!', 'bottom', false, 2500);

                    } else {
                        for (var i = 0; i < userChannels.length; i++) {
                            if (userChannels[i] == channelName) {
                                userChannels.splice(i, 1);
                            }
                        }
                    }
                    $packingService.storeUser();
                } else {
                    console.log(header, "subbing or unsubbing failed in the server side");
                    status = !status;
                }
            });
    }

    //To enable loading from firebase uncomment this

    /*firebase_channels.$loaded().then(function(){
    	console.log(firebase_channels);
    	setToggles(userChannels, firebase_channels);
    });*/

});


function packagePayload(channelName, status, userToken) {
    return {
        userToken: userToken,
        channelName: channelName,
        status: status
    }
}

function setToggles(userChannels, firebase_channels) {
    for (var i = 0; i < userChannels.length; i++) {
        firebase_channels.forEach(function(channel) {
            if (channel.channelName == userChannels[i]) {
                channel.status = true;
            }
        });
    }
}