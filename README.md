# MultiLang - Cisco Spark bot
Bot to translate the text from many to many other languages, thanks to Cisco and google :-)

Integrated with:
* Cisco Spark as business messaging for the supported chat platform
* Google Translate API
* auto translation mode
* user settings

## What
The main idea is so to provide a text translator tool by chat for:
* 1:1 chat room
* group chat

Features:
* 107 languages
* command to configure auto-translation
* permanent db storage for the user settings (redis)

## Commands to configure auto translation
* `on`: active the auto translation
* `off`: deactive the auto translation
* `config`: provide the current config
* `config [lang in] [lang out]`: configure the auto translation
* `state`: provide the current state

## Translation

### Manual
`[lang in] [lang out] [*/phrase]
* en fr I like it!
* fr de j\'ai un rendez-vous demain

### Automatic
`[\*/phrase]`

* I like it!

### Supported languages
*107*, in summary
* en - English
* es - Spanish
* fr - French
* de - German
* ru - Russian
* it - Italian
* ja - Japanese
* ar - Arabic
* zh-CN - Chinese (Simplified)
* zh-TW - Chinese (Traditional)

Full list: https://cloud.google.com/translate/docs/languages

# BigData with Logstash connector embeded
Settings is done to send all chat messages formatted properly to a log stash system.

Thanks to active it in the configuration file
```bash
config.js
> config.bigdata.enable = true;
```

# HowTo

## Installation
* Clone localy
`git clone https://github.com/guillain/MultiLang.git`
* Go into the folder
`cd ServiceDeskBot`

## Configuration
* Put your CSV file (named km.csv) in the conf folder (key->txt structure)
`cp [your CSV file] app/conf/km.csv`
* Config your app with your [spark bot](https://developer.ciscospark.com/apps.html)
`vi app/config.js`

## Running

### PM2 environment

* Install dependencies
`npm install`
* Run the application, two configuration availables
* 1/ For the dev, node is used
`./run manual`
* 2/ For the prod, pm2 is used (install also this dependency)
`./run [start|stop|restart|show|status|log]`
* Add the bot in 1:1 or in chat group room

### Docker
Provided also for Docker env. with the Dockerfile for the standalone builder

To build the image:
`docker build -t bot/multilang .`

To run the image:
`docker run -d -p 8083:3333 bot/multilang`

To go in the container:
`docker exec -it bot/multilang /bin/bash`

To check the logs
`docker logs bot/multilang --details -f`

## Current issue
* flint Redis storage (issue: https://github.com/flint-bot/flint/issues/22). Thanks to use the old redis.js file.

# CREDITS

## Cisco Spark
* http://developer.ciscospark.com/
* https://github.com/flint-bot/flint
* https://github.com/flint-bot/sparky

## Google
* https://cloud.google.com/translate
* https://github.com/statickidz/node-google-translate-skidz

## Redis
* https://github.com/NodeRedis/node_redis
