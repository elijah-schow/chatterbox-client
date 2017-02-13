var app = {
  init: function() {
    app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';
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
  fetch: function(data, success, error) {
    $.ajax({
      'url': app.server,
      'type': 'GET',
      'data': JSON.stringify(data),
      'contentType': 'application/json',
      'success': success,
      'error': error
    });
  },
  clearMessages: function() {},
  renderMessage: function() {},
  renderRoom: function() {},
};
