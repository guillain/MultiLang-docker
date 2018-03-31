# MultiLang - Cisco Spark bot
Bot to translate the text from many to many other languages, thanks to Cisco and google :-)

Integrated with:
* Cisco Spark as business messaging
* Google Translate API
* auto translation mode
* user config setting

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

## Docker
Provided also for Docker env. with the Dockerfile for the standalone builder


## Current issue
* flint Redis storage (issue: https://github.com/flint-bot/flint/issues/22). Thanks to use the old redis.js file.

