var app = {
  server: 'http://parse.atx.hackreactor.com/chatterbox/classes/messages',
  username: new URLSearchParams(window.location.search).get('username'),
  room: 'lobby',
  roomList: {},
  friendsList: {},
  maxUsernameLength: 140,
  maxMessageLength: 1000,
  maxRoomnameLength: 140,

  init: function() {
    app.renderRoom();
    app.goToRoom(app.room);
    setInterval(app.renderRoom, 1000);
    // Event Handlers
    $('#send .submit').on('click', app.handleSubmit);
    $('#rooms').on('click', 'a.room', app.handleRoomChange);
    $('.refresh-rooms').on('click', app.handleRoomsRefresh);
    $('.create-room').on('click', app.handleRoomCreation);
    $('#chats').on('click', '.chat', app.handleFriend);
    $('#friends').on('click', 'a.friend', app.friendHandler);
  },

  handleFriend: function(e) {
    e.preventDefault();
    var username = $(this).find('.username').text();
    // Toggle friends
    if (app.friendsList.hasOwnProperty(username)) {
      delete app.friendsList[username];
      $(`.chat .username:contains(${username})`).parent().removeClass('friend');
      $(`#friends li:contains(${username})`).parent().remove();
    } else {
      app.friendsList[username] = true;
      $(`.chat .username:contains(${username})`).parent().addClass('friend');
      $('#friends').append(
        $('<li></li>').text(username)
      );
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var message = {
      'username': app.username,
      'text': $('#send .message-input').val(),
      'roomname': app.room
    };
    if (message.text) {
      app.send(message, app.renderRoom);
      //clear the input box
      $('#send .message-input').val('');
    }
  },

  handleRoomsRefresh: function(e) {
    e.preventDefault();
    app.refreshRoomList();
  },

  handleRoomChange: function(e) {
    e.preventDefault();
    app.goToRoom( $(this).text() );
  },

  handleRoomCreation: function(e) {
    e.preventDefault();
    var room = prompt('Room Name');
    app.addToRoomList(room);
    app.goToRoom(room);
  },

  send: function(data, success, error) {
    $.ajax({
      'url': app.server,
      'type': 'POST',
      'data': JSON.stringify(data),
      'contentType': 'application/json',
      //success and error are callback functions
      'success': success,
      'error': error,
      'beforeSend': app.loadStart,
      'complete': app.loadEnd
    });
  },

  fetch: function( URLParameters, success, error) {
    $.ajax({
      'url': app.server,
      'type': 'GET',
      'data': URLParameters,
      'contentType': 'application/json',
      'success': success,
      'error': error,
      'beforeSend': app.loadStart,
      'complete': app.loadEnd
    });
  },

  formatDate: function(string) {
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
    var date = new Date(string);
    var day = date.getDate();
    var month = monthNames[date.getMonth()];
    var year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  },

  renderMessage: function(message) {
    var $chat = $('<div class="chat"><span class="username"></span>: <span class="message"></span><span class="date"></span></div>');

    if (app.friendsList.hasOwnProperty(message['username'])) {
      $chat.addClass('friend');
    }
    $chat.find('.username').text(app.truncate(message['username'], app.maxUsernameLength));
    $chat.find('.message').text(app.truncate(message['text'], app.maxMessageLength));
    $chat.find('.date').text( app.formatDate(message['createdAt']) );

    $('#chats').append($chat);
  },

  clearMessages: function() {
    $('#chats').empty();
  },

  renderRoom: function() {
    var query = `order=-createdAt&where={"roomname":{"$in":["${app.room}"]}}`;
    app.fetch( query, function(data) {
      app.clearMessages();
      data.results.forEach(app.renderMessage);
    });
  },

  goToRoom: function(room) {
    if(room){
      app.room = room;
      app.renderRoom();
      app.refreshRoomList();
    }
  },

  refreshRoomList: function(){
    app.fetch('order=-createdAt&limit=1000&keys=roomname', function(data) {
      data.results.forEach(function(chat) {
        if(chat.roomname){
          var roomname = app.truncate(chat.roomname, app.maxRoomnameLength);
          app.roomList[roomname] = true;
        }
      });
      app.renderRoomList();
    });
  },

  renderRoomList: function(){
    var $element;
    $('#rooms a.room').parent().remove();
    Object.keys(app.roomList).forEach(function(roomName){
      $element = $('<li></li>').append(
          $('<a class="room" href="#"></a>')
            .text(roomName)
      );
      if(roomName === app.room) {
        $element.find('a.room').addClass('selected');
      };
      $('#rooms').prepend($element);
    });
  },

  addToRoomList: function(room) {
    app.roomList[room] = true;
  },

  truncate: function(string, maxLength) {
    var end = Math.min(string.length, maxLength);
    return string.substring(0, end);
  }
};
