# Flamethrower

Flamethrower is a general purpose Campfire bot that listens to a room
and relays every post to another service that supports a JSON API.
The goal was to separate the concerns of collecting content from Campfire
and doing something meaningful with that content.

In our case at EdgeCase, we have a Campfire room we post to every morning
stating what we're working on and what we hope to accomplish that day.
I wanted a better way to visualize this data, so I created flamethrower to
listen to the room and separate web app to represent the data.

## Configuration & Deployment

Flamethrower is ready out-of-the-box to deploy to Heroku:

    heroku create --stack cedar
    git push heroku master
    heroku ps:scale flamethrower=1

To do anything meaningful, however, you'll need to configure it.
Configuration is all done through environment variables on Heroku:

    heroku config:add CAMPFIRE_TOKEN=tokenforyourcampfireaccount
    heroku config:add CAMPFIRE_ROOM=123456
    heroku config:add TARGET_HOST=your-target-app.com

## Development

## JSON API Contract
