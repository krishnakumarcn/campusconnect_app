app.controller("loginCtrl",function($scope,$http,$state,$packingService,$rootScope,$ionicLoading,$ionicPopup,$timeout){
  
/* ---------------new furnished code ----------*/

  console.log("Inside loginCtrl");
  if(localStorage.getItem('loggedIn')){
		 	$state.go('app.broadcast');
	}
  $rootScope.loggedIn = false;
	$rootScope.currentUser = {};
	$rootScope.currentUser.name = "User";
	$scope.payload={userId:"", password:""};

	$scope.login=function(){
	
		$http.post(addressHost,$scope.payload)
			.then(function(response){ //use the term response for data from server for consistency
                    if (response.status == 210){
					   var currentUser = $packingService.packUser(response.data);
					   localStorage.setItem('currentUser', currentUser);
					   localStorage.setItem('loggedIn', true);
					   $rootScope.loggedIn=true;
					   $rootScope.currentUser = response.data;
                       console.log($rootScope.currentUser);
                       $state.go("app.broadcast");
                       console.log("channelSub: "+ $rootScope.currentUser.subChannels);

                  }
                    else if(response.data.auth == false){
						console.log(response);
						alert("Check credentials");
					}
			},function(err){
				alert("Cant reach server");
			});
	};
});

function packUser(user){
	var pack =  {
    'userToken':user.userToken,
		'userId':user.userId,
		'name':user.name, 
		'department':user.department,
		'post':user.post,
		'adminOf':user.adminOf,
		'subChannels':user.subChannels
	}

	return JSON.stringify(pack);

}

app.controller('profileCtrl', function($scope,$ionicPopup,$rootScope,$timeout,$state,$validateLogin) {
  $scope.$on('$ionicView.enter', function() {
    $validateLogin();

   /* var myPopup=$ionicPopup.show({
              template: '',
              title: 'Logout',
              subTitle:'Really want to?',
              scope: $scope,
              buttons: [
                  {
                  text: '<b>Yes</b>',
                  type: 'button-assertive button-small',
                  onTap: function(e) {
                      localStorage.clear();
                      $state.go('login');
                  }
                  },
                  {
                    text:'<b>No</b>',
                    type:'button-balanced',
                    onTap:function(e){
                     $state.go('app.broadcast')
                    }
                  }
                
              ]
            });*/


   });
   // update pass view click to expend
    var expand=false;
    $scope.toggleBroad = function() {
      console.log(expand);
      expand=!expand;
      console.log(expand);

    };
    $scope.isBroadShown = function() {
      return expand;
    };
   
  
});
