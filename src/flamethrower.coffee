Campfire   = require('../vendor/campfire').Campfire
http       = require('http')
config     = {}

if require('path').existsSync('config.yml')
  configYaml = require('fs').readFileSync('config.yml', 'utf8')
  config     = require('yaml').eval(configYaml)

campfireToken   = process.env.CAMPFIRE_TOKEN   || config.campfireToken
campfireAccount = process.env.CAMPFIRE_ACCOUNT || config.campfireAccount
roomId          = process.env.CAMPFIRE_ROOM    || config.campfireRoomId
targetHost      = process.env.TARGET_HOST      || config.targetHost
targetPath      = process.env.TARGET_PATH      || config.targetPath
targetPort      = if targetHost is 'localhost' then 3000 else 80

campfire        = new Campfire(ssl: true, token: campfireToken, account: campfireAccount)
bot             = {}
users           = {}

campfire.me (response) ->
  bot = response.user

campfire.room roomId, (room) ->
  room.join ->
    console.log "Joining #{room.name}"

    room.listen (msg) ->
      if msg.type is 'TextMessage' and msg.user_id isnt bot.id
        postMessage msg.body, msg.user_id

  # leave the room on exit
  process.on 'SIGINT', ->
    room.leave ->
      console.log "Exiting room"
      process.exit()

  postMessage = (messageBody, userId) ->
    console.log "Posting '#{messageBody.length}' chars for #{userId}"

    body = JSON.stringify(status: { message: messageBody}, campfire_user_id: userId)

    httpOptions = {
      host:    targetHost
      port:    targetPort
      method:  'POST'
      path:    targetPath
      headers: {
        'Content-Type':   'application/json'
        'Content-Length': body.length
      }
    }

    request = http.request(httpOptions)
    request.write(body)
    request.end()
