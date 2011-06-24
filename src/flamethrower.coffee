Campfire = require('../vendor/campfire').Campfire

campfire = new Campfire { ssl: true, token: process.env.CAMPFIRE_TOKEN, account: 'edgecase' }
roomId   = process.env.CAMPFIRE_ROOM || '416570'
bot      = {}
users    = {}

campfire.me (response) ->
  bot = response.user

campfire.room roomId, ( room ) ->
  room.join ->
    console.log "Joining #{room.name}"

    room.listen ( msg ) ->
      if msg.type is 'TextMessage' and msg.user_id isnt bot.id
        findUser msg.user_id, (user) ->
          postMessage msg.body, user.name

  # leave the room on exit
  process.on 'SIGINT', ->
    room.leave ->
      console.log '\nExiting room'
      process.exit()

  findUser = (userId, callback) ->
    if users[userId]?
      callback users[userId]
    else
      campfire.user userId, (response) ->
        user = response.user
        users[userId] = user
        callback user

  postMessage = (messageBody, userName) ->
    console.log "Posting '#{messageBody}' for #{userName}"
    room.speak "#{messageBody} right back at ya #{userName}!"
