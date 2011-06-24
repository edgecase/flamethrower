(function() {
  var Campfire, bot, campfire, roomId, users;
  Campfire = require('../vendor/campfire').Campfire;
  campfire = new Campfire({
    ssl: true,
    token: process.env.CAMPFIRE_TOKEN,
    account: 'edgecase'
  });
  roomId = process.env.CAMPFIRE_ROOM || '416570';
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
        console.log('\nExiting room');
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
      console.log("Posting '" + messageBody + "' for " + userName);
      return room.speak("" + messageBody + " right back at ya " + userName + "!");
    };
  });
}).call(this);
