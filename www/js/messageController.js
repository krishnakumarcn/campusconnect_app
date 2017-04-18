app.controller('inboxController', function($scope,$state,$ionicModal,$ionicScrollDelegate, $rootScope, $validateLogin, $messaging,$ionicPopup){
    $validateLogin();
    $messaging.getLoadedInbox($scope,$ionicScrollDelegate);
    $scope.showMessage = function(message){$messaging.showMessage(message,true, $scope,$ionicPopup);}
    // msg view click to expend
    $scope.toggleMessage = function(msg) {
        if($scope.isMsgShown(msg)){
            msg.show = !msg.show;
        }
        else{
            msg.show = !msg.show;
            $scope.showMessage(msg);
        }
     
    };
    $scope.isMsgShown = function(msg) {
      return msg.show;
    };

    $scope.compose=function(){
        $state.go("app.compose")
    }
    $scope.sentItems=function(){
       $state.go("app.sentItems");
    }
    $scope.delete = function(id){
        $messaging.deleteMessage(id, true);
    }

  

});

app.factory('$messaging', function($http, $rootScope){
    var messaging = {};
    messagesSent = [];
    messagesInbox = [];

   

    function loadMessageMetadata($ionicScrollDelegate,inbox,callBack){
        
        if(inbox) path= 'messages/getMetadata/';
        else path = 'messages/getMetadataSent/';

        $http.get(addressHost+ path + $rootScope.currentUser.userToken).then(function(res){

                console.log("userToken: "+$rootScope.currentUser.userToken);
            if(res.status == 200){
                $ionicScrollDelegate.scrollBottom(true);
                var messages;
                var count=0;
                if(inbox){
                    messagesInbox = JSON.parse(res.data);
                    messages = messagesInbox;
                    messages.forEach(function(message){
                        if(!message.read) count++;
                    });
                    $rootScope.messageCount = count;
                }
                else{ 
                    messagesSent = JSON.parse(res.data);
                    messages = messagesSent;
                }

                callBack(messages);
            }
            return null;
        }).catch(function(err){ 
                alert("No internet Connection??!");
        });
    }

    function getLoadedInbox($scope,$ionicScrollDelegate){
        var count =0;
        if(messagesInbox!=0){ 
            $scope.messages= messagesInbox;
        }else{
            loadMessageMetadata($ionicScrollDelegate,true, function(messages_callback){
                console.log('binding messages with inbox');
                $scope.messages= messages_callback;
            });
        }
     }
   

    
    function getMessageFromServer(id, $scope, inbox, callBack){
        if(inbox)
            path = 'messages/getMessageInbox/';
        else 
            path = 'messages/getMessageSent/';

        $http.get(addressHost+path+id)
        .then(function(res){
            $scope.currentMessage.message = res.data.message;
            callBack();
        })
        .catch(function(err){
                alert("error loading message!");
            });
    }

    messaging.deleteMessage=function(id, inbox){
        var local;
        var dest;
        if(inbox){
            local = messagesInbox;
            dest ='messages/deleteInbox/';
        }else{
            local = messagesSent;
            dest ='messages/deleteSent/';
        }

        $http.get(addressHost+dest+id)
        .then(function(res){
            if(res.status == 200){
                var index = local.findIndex(function(item){
                    if(item.id  == id) return true;
                    else return false;
                });
                if(index != -1){
                    local.splice(index, 1);
                }
            }else{
                $mdToast.show($mdToast.simple().textContent('Server Error - Message not deleted'));
            }
        })
        .catch(function(err){
            $mdToast.show($mdToast.simple().textContent('Cant reach server'));
        });
    }

    messaging.showMessage = function(message, inbox, $scope,$ionicPopup) {
        console.log("show msg");
        $scope.currentMessage = message;
        console.log($scope.currentMessage.message);
         /*var myPopup=$ionicPopup.show({
                    title: $scope.currentMessage.senderName,
                    template:$scope.currentMessage.message,
                    scope: $scope,
                    buttons: [
                        {
                        text: '<b>OK</b>',
                        type: 'button-positive',
                        onTap: function(e) {                
                        }
                        },
                    ]
                    });*/
        $scope.cancel = function(){
          //  $mdDialog.hide();
        }
        getMessageFromServer(message.id, $scope,inbox, function(){
           /* $mdDialog.show({
                templateUrl: 'html/messageDialog/messageDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                scope:$scope,
                preserveScope:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
            },function() {
               console.log("cancelled dialog");
            });*/
        });

        if(!message.read&&inbox){
            message.read = true;
            $rootScope.messageCount--;
        }
    }

    function getLoadedSent($scope,$ionicScrollDelegate){
        if(messagesSent!=0)
            $scope.messages= messagesSent;
        else{
            loadMessageMetadata($ionicScrollDelegate,false, function(messages_callback){
                console.log('binding message with sent');
                $scope.messages= messages_callback;
            });
        }
        $ionicScrollDelegate.scrollBottom(true);
    }

    messaging.loadMessageMetadata = loadMessageMetadata;
    messaging.getLoadedInbox = getLoadedInbox;
    messaging.getLoadedSent = getLoadedSent;
    return messaging;
});

/*---------------------__Sent Item_ ------------------------- */
app.controller('sentItemsController', function($scope,$state,$ionicScrollDelegate,$validateLogin, $messaging){
    $validateLogin();
    $messaging.getLoadedSent($scope,$ionicScrollDelegate);
    $scope.showMessage = function(message){
        console.log(message);
        $messaging.showMessage(message, false, $scope);
    }
    $scope.delete = function(id){
        console.log('Calling delete on '+ id);
        $messaging.deleteMessage(id,false);
    }
     // msg view click to expend
    $scope.toggleMessage = function(msg) {
        if($scope.isMsgShown(msg)){
            msg.show = !msg.show;
        }
        else{
            msg.show = !msg.show;
            $scope.showMessage(msg);
        }
     
    };
    $scope.isMsgShown = function(msg) {
      return msg.show;
    };
    $scope.inbox=function(){
        $state.go("app.inbox");
    }
    $scope.compose=function(){
        $state.go("app.compose");
    }
});

/* ---------------- compose   -----------------------*/
app.controller('composeCtrl', function($scope,  $state,$rootScope, $querySearch, $sendMessage, $validateLogin){
      $validateLogin();
     
    $scope.verifyUsername=function(){
        console.log("here:");
    }
    $scope.sentItems=function(){
        $state.go("app.sentItems");
    }
    $scope.inbox=function(){
        $state.go("app.inbox");
    }

});

app.factory('$querySearch', function($http){

    function esacpe(query){
        var esc_query = query.replace('%20','+');
        return esc_query;
    }

    function search(query, callback){
        var userList;
        $http.get(addressHost+'messages/getUsers/?query='+escape(query))
             .then(function(response){
                 callback(Array.from(JSON.parse(response.data)));
             })
             .catch(function(err){
                 console.log('Server not reachable for searching user returning empty array');
             });

    }

    return search

})

app.factory('$sendMessage', function($http){

    function send(message, $scope) {
        $http.post(addressHost+'messages/send', {message:message})
             .then(function(res){
                 if(res.status == 200){
                    // $mdToast.show($mdToast.simple().textContent('Message Sent'));
                      $scope.message.recipientId = null;
                        $scope.message.message = null;
                        $scope.selectedItem = null;
                        $scope.message.subject = null;
                 }else{
                     console.log("message not sent");
                   //  $mdToast.show($mdToast.simple().textContent('Message not sent.'));
                 }
             })
    }

    return send;

});


