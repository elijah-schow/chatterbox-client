var app = {
  server : 'http://parse.atx.hackreactor.com/chatterbox/classes/messages',
  username : new URLSearchParams(window.location.search).get('username'),
  room : 'lobby',
  friendsList: {},

  init: function() {
    app.refreshRooms();
    app.renderRoom();
    setInterval(app.renderRoom, 1000);

    // Event Handlers
    $('#send .submit').on('click', app.handleSubmit);
    $('#rooms').on('click', 'a.room', app.handleRoomChange);
    $('.refresh-rooms').on('click', app.refreshRooms);
    $('.create-room').on('click', app.createRoom);
    $('#chats').on('click', '.chat', app.friendHandler);
    $('#friends').on('click', 'a.friend', app.friendHandler);
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

  loadStart: function () {
    $('.spinner').show();
  },

  loadEnd: function () {
    $('.spinner').hide();
  },

  clearMessages: function() {
    $('#chats').empty();
  },

  renderMessage: function(message) {
    var $chat = $('<div class="chat"><span class="username"></span>: <span class="message"></span><span class="date"></span></div>');

    if (app.friendsList.hasOwnProperty(message['username'])) {
      $chat.addClass('friend');
    }
    $chat.find('.username').text(message['username']);
    $chat.find('.message').text(message['text']);
    $chat.find('.date').text( app.formatDate(message['createdAt']) );

    $('#chats').append($chat);
  },

  renderRoom: function(room) {
    room = room || app.room;
    var query = `order=-createdAt&where={"roomname":{"$in":["${room}"]}}`;
    app.fetch( query, function(data) {
      app.clearMessages();
      data.results.forEach(app.renderMessage);
    });
  },

  friendHandler: function(e) {
    e.preventDefault();
    var username = $(this).find('.username').text();

    // Toggle friends
    if (app.friendsList.hasOwnProperty(username)) {
      delete app.friendsList[username];
      $(`.chat .username:contains(${username})`).parent().removeClass('friend');
      $(`#friends a.friend:content(${username})`).parent().remove();
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
      'roomname': app.currentRoom()
    };
    if (message.text) {
      app.send(message, app.renderRoom);

      //clear the input box
      $('#send .message-input').val('');
    }
  },

  handleRoomChange: function(e) {
    e.preventDefault();
    app.room = $(this).text();
    $('#rooms a.room').removeClass('selected');
    $(this).addClass('selected');
    app.renderRoom();
  },

  clearRooms: function(){
    $('#rooms a.room').remove();
  },

  refreshRooms: function() {
    // TODO: Refactor to use objects, which can be accessed in constant time
    var rooms = [];
    app.fetch('order=-createdAt&limit=1000&keys=roomname', function(data) {
      app.clearRooms();
      data.results.forEach(function(chat) {
        if (!rooms.includes(chat.roomname) && chat.roomname) {
          rooms.push(chat.roomname);
          app.addToRoomList(chat.roomname);
        }
      });
    });
  },

  createRoom: function() {
    var room = prompt('Room Name');
    app.addToRoomList(room);
    $('.room').val(room);
  },

  addToRoomList: function(name) {
    $('#rooms').prepend(
      $('<li></li>').append(
        $('<a class="room" href="#"></a>')
          .text(name)
      )
    );
  },

  currentRoom: function() {
    return $('#rooms a.room.selected').text() || 'lobby';
  },

  formatDate: function(string) {
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
    var date = new Date(string);
    var day = date.getDate();
    var month = monthNames[date.getMonth()];
    var year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }
};
