var socket = io.connect();

// $( document ).ready(function() {
//   $('[contenteditable]').on('paste',function(e) {
//     //alert('xxxx');
//     e.preventDefault();
//       var text = (e.originalEvent || e).clipboardData.getData('text/plain');
//       window.document.execCommand('insertText', false, text);
//       //$('[contenteditable]').trigger('keyup');
//
//   });
// });
var app = angular.module('app', ['yaru22.angular-timeago','contenteditable']);
app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
  });
app.directive('schrollBottom', function () {
    return {
      scope: {
        schrollBottom: "="
      },
      link: function (scope, element) {
        scope.$watchCollection('schrollBottom', function (newValue) {
          if (newValue)
          {
            $(element).scrollTop($(element)[0].scrollHeight);
          }
        });
      }
    }
  });
app.directive('myEnter', function () {
  // call html tag my-enter="....()"
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
  });
app.directive('enterSubmit', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      elem.bind('keydown', function(event) {
        var code = event.keyCode || event.which;

        if (code === 13) {
          if (!event.shiftKey) {
            event.preventDefault();
            scope.$apply(attrs.enterSubmit);
          }
        }
      });
    }
  }
  });
app.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
  });

app.controller('chat', function(timeAgo,$scope,$http,$compile,$window,$interval) {
  timeAgo.settings.allowFuture = true;

  $scope.load = function(){

    session_id = $scope.session_id;

$http({
    method: 'POST',
    data:{id:session_id},
    url: '/chat/chatgroup'
  }).then(function successCallback(response) {

    $scope.list_group = response.data;

  }, function errorCallback(response) {});

  $http({
    method: 'POST',
    data:{id:session_id},
    url: '/chat/chatActivities'
  }).then(function successCallback(response) {
    //console.log(response.data);
    $scope.activities = response.data;

  }, function errorCallback(response) {});
  $scope.list[session_id] = [];
  $http({
    method: 'POST',
    data:{id:session_id},
    url: '/chat/chatList1'
  }).then(function successCallback(response) {

    $scope.list[session_id] = response.data


    dataonline = [];
    $.each(response.data, function( index, value ) {
      dataonline.push(value._id);
    });
    $http({
      method: 'POST',
      data:dataonline,
      url: '/chat/useronline'
    }).then(function successCallback(response) {

      $.each(dataonline, function( index, data_online ) {

        $scope.list[session_id][index].online = "<div class=' mystate iamoffline'></div>ออฟไลน์</span>";
        $('.online'+data_online).addClass('iamoffline');
        $('.online_text'+data_online).html('ออฟไลน์');
      });
      $.each(response.data, function( index, data_online ) {
        if(data_online.status_online == 1){
          $scope.list[session_id][index].online = "<div class=' mystate iamonline'></div>ออนไลน์</span>";
          $('.online'+data_online._id).addClass('iamonline');
          $('.online_text'+data_online._id).html('ออนไลน์');
        }else if(data_online.status_online == 2){
          $scope.list[session_id][index].online = "<div class=' mystate iamalway'></div>ออนไลน์แต่กำลังทำบางอย่าง</span>";
          $('.online'+data_online._id).addClass('iamalway');
          $('.online_text'+data_online._id).html('ออนไลน์แต่กำลังทำบางอย่าง');
        }else{
          $scope.list[session_id][index].online = "<div class=' mystate iamoffline'></div>ออฟไลน์</span>";
          $('.online'+data_online._id).addClass('iamoffline');
          $('.online_text'+data_online._id).html('ออฟไลน์');
        }
      });

    })
  });
Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
  };




  var total_popups = 0;
  var popups = [];
  var data_chat = [];
  var chat = [];
  var check_pop = [];
  var count = 0;

var timer_server;
var time_client;
socket.on('getChat',function(data){


  //updateChat1('56fcc84ebfc25d054719da2e',data.data_chat);
  $.each($scope.list_group, function( index, value ) {
    console.log(value.groupid);
    if(value.groupid == data.id && session_id != data.ids){
        console.log(data.data_chat.group_id)
        updateChat1(data.data_chat.group_id,data.data_chat);
          angular.element('.autoclickid'+data.id).triggerHandler('click');
        // angular.element('.autoclickid'+data.id).triggerHandler('click');
        // console.log()
      // if(popups.indexOf(data.id) == '-1'){
      //
      // }
    }
  });
  //console.log($scope.list_group.groupid+''+data.id);
  // if($scope.list_group.groupid.indexOf(data.id) == '-1'){
  //   updateChat1(data.data_chat.group_id,data.data_chat);
  // }
  // if($scope.list_group.groupid == data.id){
  //   updateChat1(data.data_chat.group_id,data.data_chat);
  // }
  if(session_id == data.id){

    count = 0;
    clearInterval(timer_server);
    timer_server = setInterval(function(){
         count++;
         if(count == 2){
           clearInterval(timer_server);
           loadListChat(session_id);
        }

     }, 1000);

    loadListChat(session_id);

    updateChat1(data.data_chat.group_id,data.data_chat);
    angular.element('.autoclickid'+data.ids).triggerHandler('click');
    // if(popups.indexOf(data.ids) == '-1'){
    //   angular.element('.autoclickid'+data.ids).triggerHandler('click');
    // }
}


});
//setTimeout(loadListChat, 2000);

$scope.sendChatMessage = function(gid,id){
  if(!gid){
    gid = id;
    //id = session_id;
  }

  if(!$scope.message[id]){
    $scope.message_check[id] = true;
  }else{
    $scope.message_check[id] = false;
    $http({
      method: 'POST',
      data:{gid:gid,user_id:session_id,message:$scope.message[id]},
      url: '/chat/sendChatMessage'
    }).then(function successCallback(response) {
      $scope.message[id] = '';
      data = {id:id,ids:session_id,gid:gid,data_chat:response.data}
      updateChat1(gid,response.data);
      socket.emit('sendChat', data)
      clearInterval(time_client);
      count = 0;
      time_client = setInterval(function(){
           count++;

           if(count == 2){
             clearInterval(time_client);

             loadListChat(session_id);
          }
        }, 1000);
    }, function errorCallback(response) {});

  }

}
$scope.getTimeAgo = function(date){
  return "<span data-livestamp="+date+"></span>";
}
function updateChat1(gid,chatMessage){

    $.each($scope.data_chat,function(index,data){

        if(data.gid == gid){
          console.log(data.gid == gid);
          console.log($scope.data_chat);
        //  $scope.data_chat[index].chat = "123545";
          $scope.data_chat[index].chat.push(chatMessage);


        }
    })
    //console.log($scope.data_chat[0].chat);


}
socket.on('MessageLoad1',function(data1){

  if(data1.user_id != session_id){
    if(data1.fucus){
      $('.loadMessage'+data1.user_id).html('กำลังพิมพ์ข้อความ..');
    }else{
      $('.loadMessage'+data1.user_id).html('');
    }
  }

});
$scope.focusInput = function(id){

  if($scope.message[id]){
    socket.emit('MessageLoad', {user_id:session_id,fucus:true});
  }else{
    socket.emit('MessageLoad', {user_id:session_id,fucus:false});
  }
}
$scope.pasteHtml = function(e,id){
  //$('[contenteditable]').on('paste',function(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    $('[contenteditable]').html(text);

}

function loadListChat(id){

  $http({
    method: 'POST',
    data:{id:id},
    url: '/chat/chatList1'
  }).then(function successCallback(response1) {

    $scope.list[id] = response1.data
    //console.log($scope.list[id])
    dataonline = [];
    $.each(response1.data, function( index, value ) {
      dataonline.push(value._id);
    });
    $http({
      method: 'POST',
      data:dataonline,
      url: '/chat/useronline'
    }).then(function successCallback(response) {
      $.each(dataonline, function( index, data_online ) {

        $scope.list[session_id][index].online = "<div class=' mystate iamoffline'></div>ออฟไลน์</span>";
        $('.online'+data_online).addClass('iamoffline');
        $('.online_text'+data_online).html('ออฟไลน์');
      });
      $.each(response.data, function( index, data_online ) {
        if(data_online.status_online == 1){
          $scope.list[session_id][index].online = "<div class=' mystate iamonline'></div>ออนไลน์</span>";
          $('.online'+data_online._id).addClass('iamonline');
          $('.online_text'+data_online._id).html('ออนไลน์');
        }else if(data_online.status_online == 2){
          $scope.list[session_id][index].online = "<div class=' mystate iamalway'></div>ออนไลน์แต่กำลังทำบางอย่าง</span>";
          $('.online'+data_online._id).addClass('iamalway');
          $('.online_text'+data_online._id).html('ออนไลน์แต่กำลังทำบางอย่าง');
        }else{
          $scope.list[session_id][index].online = "<div class=' mystate iamoffline'></div>ออฟไลน์</span>";
          $('.online'+data_online._id).addClass('iamoffline');
          $('.online_text'+data_online._id).html('ออฟไลน์');
        }
      });


    })
  });
  }
$scope.register_popup = function(id,user_id,name,picture,type){

    for(var iii = 0; iii < popups.length; iii++){
      if(id == popups[iii]){
        Array.remove1(popups, iii);
        if(type == 'p'){
          popups.unshift(id);//user_id
        }else{
          popups.unshift(id);
        }

        calculate_popups();
        return;
      }
    }

    if(type == 'p'){
      $http({
          method: 'POST',
          data:{id:session_id,friend_id:user_id,gid:id},
          url: '/chat/chatMessage'
        }).then(function successCallback(response) {
          console.log(response.data);
          if(response.data == 'err'){
            messageChat = [];
          }else{
            messageChat = response.data;
          }
          if($scope.data_chat != null){
            if(id == null){
              addActivities(session_id,user_id,function(result){
                chat = {gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat}
                addPop(result.data._id+'');
                insert_array(result.data._id,chat);
                loadListChat(session_id);
              });
            }else{
              console.log('sdfsdflksdflskdjflsd');
              addPop(id);

              chat = {gid:id,id:user_id,name:name,picture:picture,chat:messageChat}
              console.log(chat);
              insert_array(id,chat);

            }

          }else{
            if(id == null){
              addActivities(session_id,user_id,function(result){
                chat = [{gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat}];
                id = result.data._id;
                addPop(id+'');
                $scope.data_chat = chat;

                loadListChat(session_id);
                $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                  calculate_popups();
                  $('.boxchat'+user_id).scrollTop($('.boxchat'+user_id)[0].scrollHeight);
                });
              })

            }else{
              addPop(id+'');
              chat = [{gid:id,id:user_id,name:name,picture:picture,chat:messageChat}]
              $scope.data_chat = chat;

              $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                calculate_popups();

                $('.boxchat'+user_id).scrollTop($('.boxchat'+user_id)[0].scrollHeight);
              });
            }
          }

        }, function errorCallback(response) {});
    }else{
      $http({
        method: 'POST',
        data:{id:session_id,group_id:id},
        url: '/chat/chatGroupMessage'
      }).then(function successCallback(response) {
        console.log(response.data);
        if(response.data == 'err'){
          messageChat = [];
        }else{
          messageChat = response.data;
        }
        if($scope.data_chat != null){
          chat = {gid:id,id:id,name:name,picture:picture,chat:messageChat}
          insert_array(id,chat);

        }else{
          chat = [{gid:id,id:id,name:name,picture:picture,chat:messageChat}]
          $scope.data_chat = chat;
            console.log('xxxx');

          $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            calculate_popups();

          $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);
          });
        }
        //$scope.list_group = response.data;
      }, function errorCallback(response) {});

    }
    // if(type == 'p'){
    //   if(popups.length == 0){
    //     popups.unshift(id);
    //   }else{
    //     if(popups.indexOf(id) == '-1'){
    //       popups.unshift(id);
    //     }
    //   }
    // }else{
    //   if(popups.length == 0){
    //     popups.unshift(id);
    //   }else{
    //     if(popups.indexOf(id) == '-1'){
    //       popups.unshift(id);
    //     }
    //   }
    //
    // }
    console.log(popups);




}
function addPop(id){

    if(popups.length == 0){
      popups.unshift(id);
    }else{
      console.log(popups.indexOf(id));
      if(popups.indexOf(id) == '-1'){
        console.log('x');
        popups.unshift(id);
      }
    }

    console.log(popups);

}
Array.remove1 = function(array, from, to) {

  var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };
function addActivities(session_id,user_id,callback){
    $http({
      method: 'POST',
      data:{id:session_id,user_id:user_id},
      url: '/chat/addActivities'
    }).then(function successCallback(resGroup) {
      callback(resGroup)
    })
  }
$scope.close_popup = function(id){
    for(var iii = 0; iii < popups.length; iii++){
      if(id == popups[iii]){
          Array.remove1(popups, iii);
          document.getElementById(id).style.display = "none";
          calculate_popups();
          return;
      }
    }
  }
// function insert_group(gid,chat_insert){
//   var ck = true;
//   $.each($scope.data_chat,function(index,data){
//     if(data.id == id){
//       ck = false;
//     }
//   })
// }
function insert_array(id,chat_insert){
  var ck = true;
  console.log(id);
  $.each($scope.data_chat,function(index,data){
    if(data.id == id){

      ck = false;
    }
  })
  if(ck){
  $scope.data_chat.push(chat_insert);
  console.log($scope.data_chat);
  //calculate_popups();

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    calculate_popups();

    $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);
    //$('.msgsc').scrollTop($('.msgsc')[0].scrollHeight);
  });

  }else{

    calculate_popups();
    $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);

  }


}

function display_popups(){
    var calRight = $('.chat-sidebar-sp').width();
    var right = 340;
    var iii = 0;

    for(iii; iii < total_popups; iii++){
      if(popups[iii] != undefined){
        var element = document.getElementById(popups[iii]);
        element.style.right = right + "px";
        right = right + 340;
        element.style.display = "block";
      }
    }
    for(var jjj = iii; jjj < popups.length; jjj++){
      var element = document.getElementById(popups[jjj]);
      element.style.display = "none";
    }
}
function calculate_popups(){
  var width = window.innerWidth;
  if(width < 540){
      total_popups = 0;
  }
  else{
      width = width - 320;
      total_popups = parseInt(width/340);
  }
  display_popups();
}
$scope.newDate = function(date){

  return new Date(1000 *date).toString();
}
$scope.checkMesFriend = function(id){
  if(session_id != id ){
    return true;
  }else{
    return false;
  }
}
$scope.checkMesMe = function(id){
  if(session_id == id ){
      return true;
    }else{
      return false;
    }
  }
$scope.check_num = function(num){
    if(num > 5){
      return '...และอีก '+(num - 5)+' คน';
    }else{
      return '';
    }
}

window.addEventListener("resize", calculate_popups);
window.addEventListener("load", calculate_popups);
}

});
