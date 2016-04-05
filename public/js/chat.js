var socket = io.connect();

var app = angular.module('app_chat', ['contenteditable']);
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

app.controller('chat', function($scope,$http,$compile,$window,$interval) {


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

    dataonlineac = [];
    $scope.activities = response.data;
    $.each(response.data, function( index, value ) {
      if(value.status == 'shop'){
        dataonlineac.push(value.user_id);
      }else{
        dataonlineac.push(value._id);
      }
    });

    userOnlines(dataonlineac,function(online){
      $.each(online,function(index,data){
        $scope.activities[index].online = data;
      });
    })

  }, function errorCallback(response) {});

  $http({
    method: 'POST',
    data:{id:session_id},
    url: '/chat/chatList1'
  }).then(function successCallback(response) {
    $scope.list = response.data
    dataonline = [];
    $.each(response.data, function( index, value ) {
      dataonline.push(value._id);
    });

    userOnlines(dataonline,function(online){
      $.each(online,function(index,data){
        $scope.list[index].online = data;
      });
    });
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

    if(value.groupid == data.id && session_id != data.ids){

        updateChat1(data.data_chat.group_id,data.data_chat);
        angular.element('.autoclickid'+data.id).triggerHandler('click');
    }
  });
$.each($scope.list, function( index, list ) {
    if(list.gid == data.gid && session_id != data.ids){
      console.log(list.gid+" "+data.gid)
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
      angular.element('.autoclickid'+data.data_chat.group_id).triggerHandler('click');

    }

  })
  $.each($scope.activities, function( index, ac ) {
    if(ac.gid == data.gid && session_id != data.ids){
      //console.log(list.gid+" "+data.gid)
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
      angular.element('.autoclickid'+data.data_chat.group_id).triggerHandler('click');

    }

  })
  console.log(session_id == data.id);
//   if(session_id == data.id){
//     console.log(data)
//     count = 0;
//     clearInterval(timer_server);
//     timer_server = setInterval(function(){
//          count++;
//          if(count == 2){
//            clearInterval(timer_server);
//            loadListChat(session_id);
//         }
//
//      }, 1000);
//
//     loadListChat(session_id);
//
//     updateChat1(data.data_chat.group_id,data.data_chat);
//     angular.element('.autoclickid'+data.data_chat.group_id).triggerHandler('click');
//
// }


});
//setTimeout(loadListChat, 2000);
function userOnlines(data_array,callback){
  $http({
    method: 'POST',
    data:data_array,
    url: '/chat/useronline'
  }).then(function successCallback(response) {
    userOnline = [];
    $.each(data_array, function( index, data_online ) {
      userOnline.push("<div class=' mystate iamoffline'></div>ออฟไลน์</span>");
    });
    $.each(response.data, function( index, data_online ) {
      if(data_online.status_online == 1){
        userOnline[index] = "<div class=' mystate iamonline'></div>ออนไลน์</span>";
        //userOnline.push("<div class=' mystate iamonline'></div>ออนไลน์</span>");
      }else if(data_online.status_online == 2){
        userOnline[index] = "<div class=' mystate iamalway'></div>ออนไลน์แต่กำลังทำบางอย่าง</span>";
        //userOnline.push("<div class=' mystate iamalway'></div>ออนไลน์แต่กำลังทำบางอย่าง</span>");
      }else{
        userOnline[index] = "<div class=' mystate iamalway'></div>ออฟไลน์</span>";
        //userOnline.push("<div class=' mystate iamoffline'></div>ออฟไลน์</span>");
      }
    });

    callback(userOnline);
  });
}
$scope.sendChatMessage = function(gid,id,picture){
  if(!gid){
    gid = id;
    //id = session_id;
  }

  if(!$scope.message[gid]){
    $scope.message_check[gid] = true;
  }else{
    $scope.message_check[gid] = false;
    $http({
      method: 'POST',
      data:{gid:gid,user_id:session_id,message:$scope.message[gid]},
      url: '/chat/sendChatMessage'
    }).then(function successCallback(response) {
      $scope.message[gid] = '';
      response.data.chat.picture = response.data.picture;
      data = {id:id,ids:session_id,gid:gid,data_chat:response.data.chat}


      updateChat1(gid,response.data.chat);
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

        //  $scope.data_chat[index].chat = "123545";
          $scope.data_chat[index].chat.push(chatMessage);


        }
    })



}
socket.on('MessageLoad1',function(data){

  // $.each($scope.list_group,function(index,data){
  //   if(gid )
  // });
  console.log(session_id+" === "+data.user_id)
  if(session_id != data.user_id){
    if(data.fucus){
      $('.loadMessage'+data.gid).html('กำลังพิมพ์ข้อความ..');
    }else{
      $('.loadMessage'+data.gid).html('');
    }
  }



});
$scope.focusInput = function(id){

  if($scope.message[id]){
    socket.emit('MessageLoad', {gid:id,user_id:session_id,fucus:true});
  }else{
    socket.emit('MessageLoad', {gid:id,user_id:session_id,fucus:false});
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

    $scope.list = response1.data

    dataonline = [];
    $.each(response1.data, function( index, value ) {
      dataonline.push(value._id);
    });
    userOnlines(dataonline,function(online){
      $.each(online,function(index,data){
        $scope.list[index].online = data;
      });
    });
  });
  }
$scope.register_popup = function(id,user_id,name,picture,type,status){

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
    var status_list;
    if(status == 'shop'){
      status_list = 'shop';
    }else if(status == 'user'){
      status_list = 'user';
    }else{
      status_list = 'user';
    }
    if(type == 'p'){
      $http({
          method: 'POST',
          data:{id:session_id,friend_id:user_id,gid:id},
          url: '/chat/chatMessage'
        }).then(function successCallback(response) {

          if(response.data == 'err'){
            messageChat = [];
          }else{
            messageChat = response.data;
          }
          if($scope.data_chat != null){
            if(id == null){
              addActivities(session_id,user_id,function(result){

                chat = {gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list}
                addPop(result.data._id+'');
                insert_array(result.data._id,chat);
                loadListChat(session_id);
              });
            }else{
              addPop(id);
              chat = {gid:id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list}

              insert_array(id,chat);

            }

          }else{
            if(id == null){
              addActivities(session_id,user_id,function(result){
                chat = [{gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list}];
                id = result.data._id;
                addPop(id+'');
                $scope.data_chat = chat;

                loadListChat(session_id);
                $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                  calculate_popups();
                  $('.boxchat'+result.data._id).scrollTop($('.boxchat'+result.data._id)[0].scrollHeight);
                });
              })

            }else{
              addPop(id+'');
              chat = [{gid:id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list}]
              $scope.data_chat = chat;

              $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                calculate_popups();

                $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);
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

        if(response.data == 'err'){
          messageChat = [];
        }else{
          messageChat = response.data;
        }
        if($scope.data_chat != null){
          addPop(id);
          chat = {gid:id,id:id,name:name,picture:picture,chat:messageChat,status:status_list}
          insert_array(id,chat);

        }else{
          addPop(id);
          chat = [{gid:id,id:id,name:name,picture:picture,chat:messageChat,status:status_list}]
          $scope.data_chat = chat;
          $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            calculate_popups();

          $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);
          });
        }
        //$scope.list_group = response.data;
      }, function errorCallback(response) {});

    }






}
function addPop(id){

    if(popups.length == 0){
      popups.unshift(id);
    }else{

      if(popups.indexOf(id) == '-1'){

        popups.unshift(id);
      }
    }



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

function insert_array(id,chat_insert){
  var ck = true;

  $.each($scope.data_chat,function(index,data){
    if(data.id == id){
      ck = false;
    }
  })
  if(ck){
    $scope.data_chat.push(chat_insert);

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
