Campfire = require('../vendor/campfire').Campfire
http     = require('http')

campfire  = new Campfire(ssl: true, token: process.env.CAMPFIRE_TOKEN, account: 'edgecase')
roomId    = process.env.CAMPFIRE_ROOM || '416570'
bot       = {}
users     = {}
targetHost = process.env.TARGET_HOST || 'localhost'
targetPort = if targetHost is 'localhost' then 3000 else 80

campfire.me (response) ->
  bot = response.user

campfire.room roomId, (room) ->
  room.join ->
    console.log "Joining #{room.name}"

    room.listen (msg) ->
      if msg.type is 'TextMessage' and msg.user_id isnt bot.id
        findUser msg.user_id, (user) ->
          postMessage msg.body, user.name

  # leave the room on exit
  process.on 'SIGINT', ->
    room.leave ->
      console.log "Exiting room"
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
    console.log "Posting '#{messageBody.length}' chars for #{userName}"

    body = JSON.stringify(status: { message: messageBody, name: userName })

    httpOptions =
      host:    targetHost,
      port:    targetPort,
      method:  'POST',
      path:    '/statuses',
      headers:
        'Content-Type':   'application/json',
        'Content-Length': body.length

    request = http.request(httpOptions)
    request.write(body)
    request.end()
