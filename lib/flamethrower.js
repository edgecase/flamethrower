(function() {
  var Campfire, bot, campfire, dailyHost, dailyPort, http, roomId, users;
  Campfire = require('../vendor/campfire').Campfire;
  http = require('http');
  campfire = new Campfire({
    ssl: true,
    token: process.env.CAMPFIRE_TOKEN,
    account: 'edgecase'
  });
  roomId = process.env.CAMPFIRE_ROOM || '416570';
  bot = {};
  users = {};
  dailyHost = process.env.DAILY_HOST || 'localhost';
  dailyPort = dailyHost === 'localhost' ? 3000 : 80;
  campfire.me(function(response) {
    return bot = response.user;
  });
  campfire.room(roomId, function(room) {
    var findUser, postMessage;
    room.join(function() {
      console.log("Joining " + room.name);
      return room.listen(function(msg) {
        if (msg.type === 'TextMessage' && msg.user_id !== bot.id) {
          return findUser(msg.user_id, function(user) {
            return postMessage(msg.body, user.name);
          });
        }
      });
    });
    process.on('SIGINT', function() {
      return room.leave(function() {
        console.log("Exiting room");
        return process.exit();
      });
    });
    findUser = function(userId, callback) {
      if (users[userId] != null) {
        return callback(users[userId]);
      } else {
        return campfire.user(userId, function(response) {
          var user;
          user = response.user;
          users[userId] = user;
          return callback(user);
        });
      }
    };
    return postMessage = function(messageBody, userName) {
      var body, httpOptions, request;
      console.log("Posting '" + messageBody.length + "' chars for " + userName);
      body = JSON.stringify({
        status: {
          message: messageBody,
          name: userName
        }
      });
      httpOptions = {
        host: dailyHost,
        port: dailyPort,
        method: 'POST',
        path: '/statuses',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body.length
        }
      };
      request = http.request(httpOptions);
      request.write(body);
      return request.end();
    };
  });
}).call(this);
