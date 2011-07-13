(function() {
  var Campfire, bot, campfire, campfireAccount, campfireToken, config, configYaml, http, roomId, targetHost, targetPath, targetPort, users;
  Campfire = require('../vendor/campfire').Campfire;
  http = require('http');
  config = {};
  if (require('path').existsSync('config.yml')) {
    configYaml = require('fs').readFileSync('config.yml', 'utf8');
    config = require('yaml').eval(configYaml);
  }
  campfireToken = process.env.CAMPFIRE_TOKEN || config.campfireToken;
  campfireAccount = process.env.CAMPFIRE_ACCOUNT || config.campfireAccount;
  roomId = process.env.CAMPFIRE_ROOM || config.campfireRoomId;
  targetHost = process.env.TARGET_HOST || config.targetHost;
  targetPath = process.env.TARGET_PATH || config.targetPath;
  targetPort = targetHost === 'localhost' ? 3000 : 80;
  campfire = new Campfire({
    ssl: true,
    token: campfireToken,
    account: campfireAccount
  });
  bot = {};
  users = {};
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
        host: targetHost,
        port: targetPort,
        method: 'POST',
        path: targetPath,
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
