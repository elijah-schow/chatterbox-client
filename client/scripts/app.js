var app = {
  init: function() {
    // Properties
    app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';
    app.username = new URLSearchParams(window.location.search).get('username');

    // Event Handlers
    $('#send .submit').on('click', app.handleSubmit);

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
  fetch: function(success, error) {
    $.ajax({
      'url': app.server,
      'type': 'GET',
      'data': 'order=-createdAt',
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
  renderRoom: function() {
    app.fetch(function(data) {
      app.clearMessages();
      data.results.forEach(app.renderMessage);
      console.log(data);
    });
  },
  escape: function(string) {
    //TODO: escape on output, to prevent XSS
    return string;
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var message = {
      'username': app.username,
      'text': $('#send .message-input').val(),
      'roomname': 'lobby'
    };
    app.send(message, function(data) {
      console.log(data);
      app.renderRoom();
    });
    $('#send .message-input').val('');    // Clear the input box
  }
};

