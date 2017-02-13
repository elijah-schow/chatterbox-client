var app = {
  init: function() {
    app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';
  },
  send: function(message, success, error) {
    $.ajax({
      'url': app.server,
      'type': 'POST',
      //Message is a javascript object
      'data': JSON.stringify(message),
      'contentType': 'application/json',
      //success and error are callback functions
      'success': success,
      'error': error,
    });
  },
  fetch: function() {},
  clearMessages: function() {},
  renderMessage: function() {},
  renderRoom: function() {},
};
