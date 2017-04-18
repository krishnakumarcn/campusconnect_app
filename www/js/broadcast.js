// 'ALL' page controller

app.controller('broadcastCtrl', function($ionicLoading,$ionicScrollDelegate,$scope,$ionicModal,$timeout,$rootScope, $state,$validateLogin,$firebaseArray,broadService ,$socket) {
  //just for displaying channels
  console.log("inside allBroad:");
  //no cached data to display but do this task on each view
  $scope.$on('$ionicView.enter', function() {
  /*  $ionicLoading.show({
      template: ['<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div></strong><p>loading..</p>']
    });
     $timeout(function(){
      $ionicLoading.hide();
      console.log("time out Loading broadcaast!!");  
    },10000);*/	
     $validateLogin();
     $scope.channels=$rootScope.currentUser.subChannels;
     
  });
    //ALL
    
    var today = new Date();
    var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
    var today_reference = firebase.database().ref('today/'+todayString);
    var firebaseToday = $firebaseArray(today_reference);
    var firebaseCollection;
    var toDisplay=[];
    firebaseToday.$watch(function(someThingHappened){
      if(someThingHappened.event == 'child_added'){
        var newChild = firebaseToday.find(function(item){return item.$id == someThingHappened.key;});
        if(newChild){
          //userSubbedChannels
          if(searchSubList(newChild.channel, $rootScope.currentUser.subChannels)){
            toDisplay.push(newChild);
          }
        }
        $scope.broadcastCollection = toDisplay;	
        console.log("loaded");

    
      }
    })
    firebaseToday.$loaded().then(function(){
       $ionicScrollDelegate.scrollBottom(true);
      // $ionicLoading.hide();
    });
    
    //still loading more than 10s?? stop it!!
    
    $scope.broadcastCollection = toDisplay;
   // $ionicLoading.hide();



  //selct channel
  $scope.channelSelectFunc = function(channel){
     $scope.modal.hide();
     console.log("put channel : "+channel);
     broadService.putChannel(channel);
     $state.go("app.broadcastView");
	}

    /* ionic model */
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();
        
    };
    // Cleanup the modal when we're done with it
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    // broad view click to expend
    $scope.toggleBroad = function(brd) {
    brd.show = !brd.show;
    };
    $scope.isBroadShown = function(brd) {
      return brd.show;
    };
  
 
});

//used to pass selected channel info btwn broadcast controllers
app.service('broadService',function(){
  var channelSelected;
  this.getChannel = function() {
       return channelSelected;
  };
  this.putChannel= function(ch){
     channelSelected=ch;
  }
});



app.controller('broadcastViewCtrl', function(broadService,$state,$ionicModal,$timeout,$ionicLoading,$scope,$ionicScrollDelegate,$anchorScroll, $rootScope, $firebaseArray, $location,$window,$validateLogin,$socket) {
  $scope.$on('$ionicView.enter', function() {
    console.log("onEnter");
    $validateLogin();
   $scope.currentFilter=broadService.getChannel();
    console.log("getChaannel : "+$scope.currentFilter);
  /*$ionicLoading.show({
    template: ['<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div></strong><p>loading..</p>']
  });*/
 
  console.log("inside broadcastViewCtrl:");
  if(angular.isUndefined($scope.currentFilter)){
    console.log("undefined aane...");
    //$scope.currentFilter='CGPU';
  }
  console.log("Chennel get: "+ $scope.currentFilter);
	var today = new Date();
	var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
	var today_reference = firebase.database().ref('today/'+todayString);
	var firebaseToday = $firebaseArray(today_reference);
	var firebaseCollection;
	var toDisplay=[];
	firebaseToday.$watch(function(someThingHappened){
		if(someThingHappened.event == 'child_added'){
			var newChild = firebaseToday.find(function(item){return item.$id == someThingHappened.key;});
			if(newChild){
        //userSubbedChannels
				if(searchSubList(newChild.channel, $rootScope.currentUser.subChannels)){
					toDisplay.push(newChild);
				}
			}
			$scope.broadcastCollection = toDisplay;	
		}
	})
  //still loading more than 10s?? stop it!!
  $timeout(function(){
   // $ionicLoading.hide();
    console.log("time out!!$");
  },10000);	
  

    /*load recent ones for all the selected channel*/
    firebaseCollection = $firebaseArray(firebase.database().ref('channel/'+$scope.currentFilter+'/broadcasts').limitToLast(50));
    firebaseCollection.$loaded().then(function(){
      $scope.broadcastCollection = firebaseCollection;
      $ionicScrollDelegate.scrollBottom(true);
     // $ionicLoading.hide();
    });
   
  });
   
  
   // broad view click to expend
    $scope.toggleBroad = function(brd) {
     brd.show = !brd.show;
    };
    $scope.isBroadShown = function(brd) {
      return brd.show;
    };
    $scope.channels=$rootScope.currentUser.subChannels;
     /* ionic model */
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();
        
    };
    // Cleanup the modal when we're done with it
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    //selct channel
  $scope.channelSelectFunc = function(channel){
     $scope.modal.hide();
     broadService.putChannel(channel);
     $state.reload()
	}


});

function searchSubList(channel, subList){
    return subList.findIndex(function(item){return item==channel;}) != -1;
}
