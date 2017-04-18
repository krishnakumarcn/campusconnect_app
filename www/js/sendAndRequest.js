app.controller('bformController',function($scope,$state,$http,$rootScope,$validateLogin,$ionicPopup,$timeout) {
    $validateLogin();
    $scope.bForm = {};
    $scope.bForm.adminApproved=false;
    $scope.bForm.message='';
    $scope.bForm.post=$rootScope.currentUser.post;
    $scope.bForm.department=$rootScope.currentUser.department;


    $scope.channelSelected = function(channelName){channelSelected(channelName, $rootScope, $scope);}
    $scope.send = function () {send($rootScope, $scope,$http,$ionicPopup,$timeout);}
    $scope.request = function() {request($rootScope, $scope, $http,$ionicPopup,$timeout);}
    $scope.cancel=function(){
        $state.go('app.sendBroascast');
    };
});

function channelSelected(channelName, rootScope, scope){
    var adminOf = rootScope.currentUser.adminOf;
    scope.bForm.channel = channelName;
    for(var i=0; i< adminOf.length; i++){
        if(channelName==adminOf[i]){
            scope.isAdmin=true;
            return;
        }
    }
    scope.isAdmin = false;
}

function send($rootScope,$scope,$http,$ionicPopup,$timeout){
    console.log($scope.bForm);
    $scope.bForm.userId = $rootScope.currentUser.userId;
    $scope.bForm.userName = $rootScope.currentUser.name;
    console.log($scope.bForm.channel);
    if($scope.bForm.message && $scope.bForm.channel){
          $scope.bForm.timestamp=new Date();
          $http.post(addressHost+"broadcast",{payload:$scope.bForm})
          .then(function(res){
              if(res.status==200){
                  var myPopup=$ionicPopup.show({
                    template: "",
                    title: "Success!",
                    subTitle:'Broadcast Posted.',
                    scope: $scope,
                    buttons: [
                        {
                        text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function(e) {                
                        }
                        },
                    ]
                    });
                    $timeout(function() {
                        myPopup.close();
                    }, 10000);
              }
              else{
                var myPopup=$ionicPopup.show({
                    template: "",
                    title: "Sorry!",
                    subTitle:"Can't reach Server",
                    scope: $scope,
                    buttons: [
                        {
                        text: '<b>OK</b>',
                        type: 'button-assertive',
                        onTap: function(e) {                
                        }
                        },
                    ]
                    });
                    $timeout(function() {
                        myPopup.close();
                    }, 10000);

              }
            });
    }
    else{        
        var myPopup=$ionicPopup.show({
                    template: "",
                    title: "Sorry!",
                    subTitle:"Some fields are Missing!!",
                    scope: $scope,
                    buttons: [
                        {
                        text: '<b>OK</b>',
                        type: 'button-assertive',
                        onTap: function(e) {                
                        }
                        },
                    ]
                    });
                    $timeout(function() {
                        myPopup.close();
                    }, 10000);
        return;
    }
}

function request($rootScope, $scope, $http,$ionicPopup,$timeout){
    $scope.bForm.userId = $rootScope.currentUser.userId;
    $scope.bForm.userName = $rootScope.currentUser.name;
    console.log($scope.bForm);
    if($scope.bForm.message && $scope.bForm.channel){
          $scope.bForm.timestamp=new Date();
          $http.post(addressHost+"broadcast/request",{payload:$scope.bForm}).then(function(res){
              if(res.status == 200){
                  var myPopup=$ionicPopup.show({
                    template: "",
                    title: "Success!",
                    subTitle:"Request Posted",
                    scope: $scope,
                    buttons: [
                        {
                        text: '<b>OK</b>',
                        type: 'button-balanced',
                        onTap: function(e) {                
                        }
                        },
                    ]
                    });
                    $timeout(function() {
                        myPopup.close();
                    }, 10000);
              }else {
                  alert("Something messed up");
              }
          });
    }else{
        console.log('No message here');
        alert("Check your message or channel");
        return;
    }
}
app.service('requestCount',function(){
  var count;
  this.getCount = function() {
       return count;
  };
  this.putCount= function(c){
     count=c;
  }
});

app.controller('incomingRequestsCtrl', function($scope,$rootScope,$firebaseArray,$http,$validateLogin,requestCount,$ionicPopup) {

    $validateLogin();

    const requestUri = '/request';
    var requestRef = firebase.database().ref(requestUri);
    var index =0;
    var requestCollection = [];
    var firebaseCollection = [];
    var request;
    var subList = Array.from($rootScope.currentUser.adminOf);

    $scope.index = index;
    $scope.request=request;
    $scope.requestCollection = requestCollection;
    $scope.next = function(){next(requestCollection, $scope);}
    $scope.prev = function(){prev(requestCollection, $scope);}
    $scope.loaded = false;
    $scope.accept = function(request){accept(request,$scope,$rootScope,$http,$ionicPopup);}
    $scope.noContent = true;

    firebaseCollection = $firebaseArray(requestRef);
    
    firebaseCollection.$loaded().then(function(){

        if(firebaseCollection.length>0){ $scope.loaded = true; $scope.noContent = false;}
        $scope.request = requestCollection[0];
    });

    firebaseCollection.$watch(function(whatHappened){
        if(firebaseCollection.length>0){ $scope.loaded = true; $scope.noContent = false;}
        if(whatHappened.event == "child_added"){
            var newChild = firebaseCollection.find(function(item){return item.$id == whatHappened.key});
            if(newChild){
                if(searchSubList(newChild.channel, subList)){
                    requestCollection.push(newChild);
                    $scope.request = requestCollection[$scope.index];
                }
            }
        }else if(whatHappened.event == 'child_removed'){
            if(firebaseCollection.length == 0) {$scope.loaded = false; $scope.noContent=true;}
            console.log('child_removed from requestCollection');
            var key = whatHappened.key;
            var indexToRemove = requestCollection.findIndex(function(item){return item.$id == key});
            if(indexToRemove!=-1){
                requestCollection.splice(indexToRemove, 1);
                if(index>=indexToRemove) decIndex($scope, requestCollection);
                $scope.request = requestCollection[index];
            
            }
        }
    });
});

function accept(request,$scope, $rootScope, $http,$ionicPopup){
    request.approvedBy = $rootScope.currentUser.userId;
    var payload = makePayload(request); 
    $http.post(addressHost+"broadcast/request/accept",{payload:payload})
         .then(function(response){
                if(response.status == 200){
                    var myPopup=$ionicPopup.show({
                template: "",
                title: "Success!!",
                subTitle:'The brodcast is posted',
                scope: $scope,
                buttons: [
                    {
                    text: '<b>OK</b>',
                    type: 'button-positive',
                    onTap: function(e) {                
                    }
                    },
                ]
                });

                console.log('[IncommingRequestController]',"The request was accepted and posted to broadcast");
             }
         });
}

function reject(){

}

function incIndex($scope, collection){
     if(++$scope.index >= collection.length){
        $scope.index =0;
    }
}

function decIndex($scope, collection){
    if(--$scope.index <0){
        $scope.index = collection.length-1;
        if($scope.index < 0) $scope.index=0;
    }
}

function next(firebaseCollection, $scope) {
    if(++$scope.index >= firebaseCollection.length){
        $scope.index =0;
    }
    $scope.request = firebaseCollection[$scope.index];
    return;
}

function prev(firebaseCollection, $scope){
    if(--$scope.index <0){
        $scope.index = firebaseCollection.length-1;
    }
    $scope.request = firebaseCollection[$scope.index];
    return;
}

function searchSubList(channel, subList){
    return subList.findIndex(function(item){return item==channel;}) != -1;
}

function makePayload(payload){
    return {
        'userId':payload.userId, 
        'userName':payload.userName,
        'key':payload.$id,
        'channel':payload.channel,
        'post':payload.post,
        'title':payload.title,
        'message':payload.message,
        'approvedBy':payload.approvedBy,
        'timestamp':payload.timestamp
    }
}