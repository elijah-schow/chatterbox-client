var app = {
  init: function() {
    // Properties
    app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';
    app.username = new URLSearchParams(window.location.search).get('username');
    app.refreshRooms();

    // Event Handlers
    $('#send .submit').on('click', app.handleSubmit);
    $('.room').on('change', app.renderRoom);
    $('.refresh-rooms').on('click', app.refreshRooms);

    // Refresh loop
    app.renderRoom();
    setInterval(app.renderRoom, 1000);
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
    });
  },
  fetch: function( URLParameters, success, error) {
    $.ajax({
      'url': app.server,
      'type': 'GET',
      'data': URLParameters,
      'contentType': 'application/json',
      'success': success,
      'error': error
    });
  },
  clearMessages: function() {
    $('#chats').empty();
  },
  renderMessage: function(message) {
    var $chat = $('<div class="chat"><span class="username"></span>: <span class="message"></span></div>');

    $chat.find('.username').text(message['username']);
    $chat.find('.message').text(message['text']);

    $('#chats').append($chat);
  },
  renderRoom: function(room) {
    room = room || app.currentRoom();
    var query = `where={"roomname":{"$in":["${room}"]}}`;
    app.fetch( query, function(data) {
      app.clearMessages();
      data.results.forEach(app.renderMessage);
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var message = {
      'username': app.username,
      'text': $('#send .message-input').val(),
      'roomname': app.currentRoom()
    };

    app.send(message, app.renderRoom);

    $('#send .message-input').val('');    // Clear the input box
  },
  refreshRooms: function() {
    app.fetch('order=-createdAt&limit=1000&keys=roomname', function(data) {
      // Get a list of rooms
      var dropdown = $('.room');
      var rooms = [];
      dropdown.empty();
      data.results.forEach(function(chat) {
        if (!rooms.includes(chat.roomname) && chat.roomname) {
          rooms.push(chat.roomname);
          dropdown.append($('<option></option>')
            .text(chat.roomname)
            .attr('value', chat.roomname));
        }
      });
    });
  },
  currentRoom: function() {
    return $('select.room').val() || 'lobby';
  },
};
