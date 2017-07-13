$(function () {
  var queryStr = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  var planId = queryStr[0].split('=')[1];
  var socket;

  if (!planId) {
    planId = window.prompt('请指定planId!');
  }

  $('.room').text('直播间：' + planId);
  $('.loginButton').click(function () {
    window.location.replace('https://uniportal-beta.huawei.com/uniportal/?redirect=' + encodeURIComponent(window.location.href));
  });

  $.ajax('/api/welink/v1/user/chat-room-ticket', {
    data: {
      'planId': planId
    },
    success: function (ticket) {
      connectToChatService('loginUser', ticket);
      if (!ticket) {
        $('.inputMask').show();
        $('.inputMessage').width('50%');
      }
    },
    error: function () {
      connectToChatService('loginUser', '');
      $('.inputMask').show();
      $('.inputMessage').width('50%');
    }
  });

  function connectToChatService (type, ticket) {
    var query = 'planId=' + planId;
    if (type === 'loginUser') {
      query += '&ticket=' + ticket;
    }

    socket = io(window.location.href, {query: query, path: '/room'});
    socket.on('new_message', function (data) {
      // 2. 接收聊天API
      // event-type: new_message
      // data: {userName: '发送人', message: '发送信息'}
      var $userNameDiv = $('<span class="username"/>').text(data.userName);
      var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
      var $messageDiv = $('<li class="message"/>').append($userNameDiv, $messageBodyDiv);
      addMessageElement($messageDiv);
    });

    socket.on('error_message', function (data) {
      // 3. 聊天异常API
      // event-type: error_message
      // data: {message: ''}
      var $messageDiv = $('<li class="error"/>').text(data.message);
      addMessageElement($messageDiv);
    });

    socket.on('online_user_count', function (data) {
      // 4. 在线用户数API
      // event-type: online_user_count
      // data: 数字
      $('.chatRoomStatus').text('当前 ' + data + ' 人在线').css('color', 'gray');
    });

    socket.on('plan_state_changed', function (data) {
      // 5. 直播间状态变更接口
      // event-type: plan_state_changed
      // data: {streamStatus: "", status: ""}
      var msg = '直播间状态发生变化, streamStatus:' + data.streamStatus + ', status:' + data.status;
      var $messageDiv = $('<li class="error"/>').text(msg);
      addMessageElement($messageDiv);
    });

    socket.on('connect_error', function (e) {
      console.log('connect_error');
      showError();
    });

    socket.on('connect_timeout', function () {
      console.log('connect_timeout');
      showError();
    });

    socket.on('disconnect', function (a, b, c) {
      showError();
    });

    $(window).keydown((event)=> {
      if (event.which === 13) {
        sendMessage();
      }
    });
  }

  function addMessageElement (el) {
    var $messages = $('.messages');
    $messages.append(el);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function sendMessage () {
    var $message = $('.inputMessage');
    if (!$message.val()) {
      return;
    }
    // 1. 发送聊天API
    // event-type: send_message
    socket.emit('send_message', {message: $message.val()});
    $message.val('');
  }

  function showError () {
    $('.chatRoomStatus').text('连接直播间异常').css('color', 'red');
  }
});
