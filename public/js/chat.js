var socket = io.connect();
var site = 'http://192.168.0.25:3000';

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


  $scope.site = 'http://192.168.0.25:3000';
  $scope.load = function(){

    session_id = $scope.session_id;
    nowGid = '';

  loadActivities(session_id);
  loadListChat(session_id);
  loadGroup(session_id);

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
socket.on('updateGroup',function(data){
  $.each($scope.list_group,function(index,group){
    if(group.groupid == data._id){
      loadGroup(session_id);
    }
  })
});
socket.on('getChat',function(data){


  //updateChat1('56fcc84ebfc25d054719da2e',data.data_chat);
  $.each($scope.list_group, function( index, value ) {

    if(value.groupid == data.id && session_id != data.ids){

        updateChat1(data.data_chat.group_id,data.data_chat);
        angular.element('.autoclickid'+data.id).triggerHandler('click');
    }
    if(session_id == data.ids){
      loadGroup(session_id);
    }
  });
$.each($scope.list, function( index, list ) {
    if(list.gid == data.gid && session_id != data.ids){

      count = 0;
      clearInterval(timer_server);
      timer_server = setInterval(function(){
           count++;
           if(count == 2){
             clearInterval(timer_server);
             loadListChat(session_id);
          }

       }, 1000);

      //loadListChat(session_id);

      updateChat1(data.data_chat.group_id,data.data_chat);
      angular.element('.autoclickid'+data.data_chat.group_id).triggerHandler('click');

    }

  })
  $.each($scope.activities, function( index, ac ) {
    if(ac.gid == data.gid && session_id != data.ids){

      count = 0;
      clearInterval(timer_server);
      timer_server = setInterval(function(){
           count++;
           if(count == 2){
             clearInterval(timer_server);
             loadActivities(session_id);
          }

       }, 1000);

      //loadListChat(session_id);

      updateChat1(data.data_chat.group_id,data.data_chat);
      angular.element('.autoclickid'+data.data_chat.group_id).triggerHandler('click');

    }
    // if(session_id == data.ids){
    //   console.log('xxx')
    //   loadActivities(session_id);
    // }

  })

});
//setTimeout(loadListChat, 2000);
function loadPopup(){
  $('.gal').each(function() {
    $(this).magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery:{enabled:true}
    });
  });
}
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
      }else if(data_online.status_online == 2){
        userOnline[index] = "<div class=' mystate iamalway'></div>ออนไลน์แต่กำลังทำบางอย่าง</span>";
      }else{
        userOnline[index] = "<div class=' mystate iamalway'></div>ออฟไลน์</span>";
      }
    });
    callback(userOnline);
  });
}
$scope.sendMail = function(){
  var data = [];
  data[0] = {from:'fandzaz@gmail.com',
              to:'jakkapong.kongkasri@hotmail.com',
              subject:'Hello World',
              html:'what the fix'
  };
  data[1] = {from:'fandzaz@gmail.com',
              to:'june_4530@hotmail.com',
              subject:'Hello World',
              html:'what the fix'
  };
  data[2] = {from:'fandzaz@gmail.com',
              to:'jakkapongkongkasri@gmail.com',
              subject:'Hello World',
              html:'what the fix'
  };

  console.log(data);
  http_post('/mail/submitMuti',{mail:data},function(data){
    console.log(data);
  });
}
$scope.updateGroup = function(gid){
  console.log(gid);
  if($scope.group_name){

    data = {user_id:session_id,gid:gid,name:$scope.group_name};
    http_post('/chat/updateNameGroup',data,function(data){
      socket.emit('updateGroup', data);
      loadGroup(session_id);
    });
  }

}
function getMemberGroup(gid){
  console.log($scope.list_group);
  $.each($scope.list_group,function(index,data){
    if(data.groupid == gid){
      $scope.list_member_group = data.user;
    }
  });

}
$scope.outFriend = function(gid,user_id){
  http_post('/chat/delUserGroup',{gid:gid,user_id:user_id},function(data){
    loadGroup(session_id);
    console.log($scope.list_member_group);
    getMemberGroup(gid);
  });
}
$scope.getFriend = function(gid){
  getMemberGroup(gid)
  $('.fade').load('/chat/showFriend/'+gid,function(result){

    var compile = $compile($('.fade').html())($scope);
    $('.fade').html(compile);
    $(".overlay, .bzn_dialog").css("opacity", 1);
    $(".overlay").show();

    var mdheight = $(".fade").height(); console.log(mdheight);
    $(".overlay, .bzn_dialog").css("opacity", 0);
    /*Remove inline styles*/
    $(".overlay, .bzn_dialog").removeAttr("style");

    /*Set min height to 90px after mdheight has been set*/
    $(".bzn_dialog").css("min-height", "90px");
    $(".overlay").show();

    $(".bzn_dialog > .preload").html("<img src='/images/loading.gif' class='loader'> ");

    $(".bzn_dialog").css("width", "200").animate({"opacity" : 1,height : mdheight,width : "320"}, 600, function() {
    /*When animation is done show inside content*/

      $(".preload").empty();
        $(".fade").show();

    });
  });
}
$scope.getSetting = function(gid){
  $('.fade').load('/chat/setting/'+gid,function(result){

    var compile = $compile($('.fade').html())($scope);
    //
    $('.fade').html(compile);
    console.log($('.fade').html());
    $(".overlay, .bzn_dialog").css("opacity", 1);
    $(".overlay").show();

    var mdheight = $(".fade").height(); console.log(mdheight);
    $(".overlay, .bzn_dialog").css("opacity", 0);
    /*Remove inline styles*/
    $(".overlay, .bzn_dialog").removeAttr("style");

    /*Set min height to 90px after mdheight has been set*/
    $(".bzn_dialog").css("min-height", "90px");
    $(".overlay").show();

    $(".bzn_dialog > .preload").html("<img src='/images/loading.gif' class='loader'> ");

    $(".bzn_dialog").css("width", "200").animate({"opacity" : 1,height : mdheight,width : "320"}, 600, function() {
    /*When animation is done show inside content*/

      $(".preload").empty();
        $(".fade").show();

    });
  });


}
$scope.submitUpload = function(){
  $('.uploadForm').ajaxSubmit({
  			error: function(error) {
  		        status('Error: ' + error.status);
        },
        success: function(data) {
          $scope.imgGroup = data.picture;
          socket.emit('updateGroup', data);
          loadGroup(session_id);
        }
  		});


  	return false;

  //});
}

$scope.sendChatPhoto = function(gid,id){
  //nowGid = gid;

  $('.fade').load('/chat/uploads',function(result){
    $(".overlay, .bzn_dialog").css("opacity", 1);
    $(".overlay").show();
    var mdheight = $(".fade").height(); console.log(mdheight);
    $(".overlay, .bzn_dialog").css("opacity", 0);
    /*Remove inline styles*/
    $(".overlay, .bzn_dialog").removeAttr("style");

    /*Set min height to 90px after mdheight has been set*/
    $(".bzn_dialog").css("min-height", "90px");
    $(".overlay").show();

    $(".bzn_dialog > .preload").html("<img src='/images/loading.gif' class='loader'> ");

    $(".bzn_dialog").css("width", "200").animate({"opacity" : 1,height : mdheight,width : "590"}, 600, function() {
    $(".preload").empty();
        $(".fade").show();
        console.log(gid);
        //$("#dropzonex").dropzone({ url: "/uploadChat",method:'post',uploadMultiple:true,maxFilesize:5,maxFiles: 12,paramName:'file',autoProcessQueue: true});
          $("#dropzonex").dropzone({
            url: site+"/chat/uploadChat",
            params: { user_id: session_id,gid:gid },
            maxFiles: 12,
            maxFilesize: 5,
            success: function(file, response){

                response.chat.picture = response.picture;
                data = {id:id,ids:session_id,gid:gid,data_chat:response.chat}
                updateChat1(gid,response.chat);
                angular.element('.autoclickid'+gid).triggerHandler('click');
                socket.emit('sendChat', data);
                //loadPopup();

            }

          });
    });
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
      socket.emit('sendChat', data);
      //loadListChat(session_id);
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
    if($scope.data_chat){
      $.each($scope.data_chat,function(index,data){
        if(data.gid == gid){
          $scope.data_chat[index].chat.push(chatMessage);
        }
      });
    }
    loadPopup();
}
socket.on('MessageLoad1',function(data){
  if(session_id != data.user_id){
    if(data.fucus){
      $('.loadMessage'+data.gid).html('กำลังพิมพ์ข้อความ..');
    }else{
      $('.loadMessage'+data.gid).html('');
    }
  }



});
function http_post(url,data,callback){
  $http({
      method: 'POST',
      data:data,
      url: url
    }).then(function successCallback(response) {
      callback(response.data);
    });
}
$scope.addGroup = function(friend_id){
  data = {id:session_id,friend_id:friend_id};
  http_post('/chat/addGroup',data,function(data){
    loadGroup(session_id);
  })

}
$scope.findFriend = function(gid){

    if($scope.findFriendG[gid].length <= 2){
      data = {id:session_id,find:$scope.findFriendG[gid]};
      http_post('/chat/findFriend',data,function(data){
          $scope.friendFind[gid] = data;
      });

    }


}
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
function loadGroup(id){
  $http({
      method: 'POST',
      data:{id:id},
      url: '/chat/chatgroup'
    }).then(function successCallback(response) {

      $scope.list_group = response.data;

    }, function errorCallback(response) {});
}
function loadActivities(id){
  $http({
    method: 'POST',
    data:{id:id},
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
$scope.register_popup = function(id,user_id,name,picture,type,status,shop){

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
    var shop_text='';
    if(shop && status=='user'){shop_text = 'ร้าน '+shop;}
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

                chat = {gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list,shop_text:shop_text,type:type}
                addPop(result.data._id+'');
                insert_array(result.data._id,chat);
                loadListChat(session_id);
              });
            }else{
              addPop(id);
              chat = {gid:id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list,shop_text:shop_text,type:type}

              insert_array(id,chat);

            }

          }else{
            if(id == null){
              addActivities(session_id,user_id,function(result){
                chat = [{gid:result.data._id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list,shop_text:shop_text,type:type}];
                id = result.data._id;
                addPop(id+'');
                $scope.data_chat = chat;

                loadListChat(session_id);
                $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                  calculate_popups();
                  loadPopup();
                  $('.boxchat'+result.data._id).scrollTop($('.boxchat'+result.data._id)[0].scrollHeight);
                });
              })

            }else{
              addPop(id+'');
              chat = [{gid:id,id:user_id,name:name,picture:picture,chat:messageChat,status:status_list,shop_text:shop_text,type:type}]
              $scope.data_chat = chat;

              $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
                calculate_popups();
                loadPopup();
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
          chat = {gid:id,id:id,name:name,picture:picture,chat:messageChat,status:status_list,type:type}
          insert_array(id,chat);

        }else{
          addPop(id);
          chat = [{gid:id,id:id,name:name,picture:picture,chat:messageChat,status:status_list,type:type}]
          $scope.data_chat = chat;
          $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            calculate_popups();
            loadPopup()
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
$scope.status_filter = function(status){
  $scope.filter = status;
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
      loadPopup();
    $('.boxchat'+id).scrollTop($('.boxchat'+id)[0].scrollHeight);
    //$('.msgsc').scrollTop($('.msgsc')[0].scrollHeight);
  });
  }else{
    calculate_popups();
      loadPopup();
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
