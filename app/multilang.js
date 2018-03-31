/**
 * @file Cisco Spark Main bot to procee myTranslator
 * @author guillain guillain@gmail.com
 * @license GPL-3.0
 */

// Import module
var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var Logstash = require('logstash-client');
var bodyParser = require('body-parser');
var _ = require('lodash');
var express = require('express');
var app = express();
var translate = require('node-google-translate-skidz');
app.use(bodyParser.json());

// Load config
var config = require('./config');

// Init flint
var flint = new Flint(config);

// Redis 
var RedisStore = require('node-flint/storage/redis'); // load driver
var redis = require("redis");
var client = redis.createClient({detect_buffers: true});
flint.storageDriver(new RedisStore('redis://127.0.0.1')); // select driver

// Help fct
// https://cloud.google.com/translate/docs/languages
help = function() {
  var help  = '## Translate \n\n';
  help += '### Description\n\n Text translation online via chat bot \n\n';
  help += '### Commands to configure auto translation\n\n';
  help += '* `on`: active the auto translation \n\n';
  help += '* `off`: deactive the auto translation \n\n';
  help += '* `config [lang in] [lang out]`: configure the auto translation \n\n';
  help += '* `state`: provide the current state \n\n';
  help += '### Translation \n\n';
  help += '#### Manual \n\n`[lang in] [lang out] [*/phrase]` \n\n';
  help += '* en fr I like it! \n\n';
  help += '* fr de j\'ai un rendez-vous demain \n\n';
  help += '#### Automatic \n\n`[*/phrase]` \n\n';
  help += '* I like it! \n\n';
  help += '### lang \n\n*107*, in summary \n\n';
  help += '* en - English \n\n';
  help += '* es - Spanish\n\n';
  help += '* fr - French \n\n';
  help += '* de - German \n\n';
  help += '* ru - Russian \n\n';
  help += '* it - Italian \n\n';
  help += '* ja - Japanese \n\n';
  help += '* ar - Arabic \n\n';
  help += '* zh-CN - Chinese (Simplified) \n\n';
  help += '* zh-TW - Chinese (Traditional) \n\n';
  help += 'Full list: https://cloud.google.com/translate/docs/languages\n\n';
  return(help);
}

// Start flint
flint.start();

// Set default messages to use markdown globally for this flint instance...
flint.messageFormat = 'markdown';

// Debug echo
flint.on('initialized', function() {
  flint.debug('initialized %s rooms', flint.bots.length);
});

// Catch all messages get for the bot
flint.on('message', function(bot, trigger, id) {
  // Debug
  flint.debug('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);

  // BigData storage
  if (config.bigdata.enable == true) {
    var message = {
      'timestamp': new Date(),
      'message': trigger.text,
      'from': trigger.personEmail,
      'spaceid': trigger.roomId,
      'spacename': trigger.roomTitle,
      'level': 'info',
      'type': 'bot'
    };

    var logstash = new Logstash({type:config.bigdata.type,host: config.bigdata.host, port: config.bigdata.port});
    logstash.send(message);
    flint.debug('Logstash recording should be ok');
  }
});

// Define express path for incoming webhooks
app.post('/flint', webhook(flint) );

// Import translate functions
flint.hears(/.*/i, function(bot, trigger, id) {
  var phrase = '';
  var tosay = '';

  // Remove hostname from argument list if found on the first argument
  if (trigger.args['0'] === config.name) { trigger.args.splice(0,1); }  

  // Storage: get, check & default
  var data = bot.recall('translatedb');
  console.log('id:' + id + ', data: ' + JSON.stringify(data, null, 4) + ', args:' + trigger.args);
  if(!data)          { data = bot.store('translatedb', {}); }
  if(!data.state)    { data.state = false; }
  if(!data.langin)   { data.langin = 'fr'; }
  if(!data.langout)  { data.langout = 'en'; }

  // Check first parameter as function
  if      ((/^help$/i.test(trigger.args['0']))   && (trigger.args.length == 1)) { bot.say('' + help()); }
  else if ((/^test$/i.test(trigger.args['0']))   && (trigger.args.length == 1)) { bot.say('test ok'); }
  else if ((/^state$/i.test(trigger.args['0']))  && (trigger.args.length == 1)) { bot.say('State: ' + data.state); }
  else if ((/^off$/i.test(trigger.args['0']))    && (trigger.args.length == 1)) { bot.say('Auto translation **OFF**'); data.state = false; }
  else if ((/^on$/i.test(trigger.args['0']))     && (trigger.args.length == 1)) { bot.say('Auto translation **ON**'); data.state = true; }
  else if ((/^config$/i.test(trigger.args['0'])) && (trigger.args.length == 1)) { bot.say('Config:\n* In: ' + data.langin + '\n* Out: ' + data.langout); }
  else if ((/^config$/i.test(trigger.args['0'])) && (trigger.args.length == 3)) { 
      // todo: check if 1 & 2 exist and in the dict
      data.langin = trigger.args['1'];
      data.langout = trigger.args['2'];
      bot.say('Configuration saved _(' + data.langin + ',' + data.langout + ')_');
  }
  else {
      var index_to_start = 0;
      if (!data.state){
        // todo: check if 0 & 1 exist and in the dict
        data.langin = trigger.args['0'];
        data.langout = trigger.args['1'];
        index_to_start = 2;
      }
      for (i = index_to_start; i < trigger.args.length; i++) { phrase += ' '+trigger.args[i]; }
      console.log('langIn:' + data.langin + ', phraseIn:' + phrase);

      translate({
        text: phrase,
        source: data.langin,
        target: data.langout
      }, function(result) {
        console.log('langOut:' + data.langout + ', phraseOut:' + result);
        bot.say('_('+data.langin+' to '+data.langout+')_ ' + result);
      });
  }
});

// Start expess server
var server = app.listen(config.port, function () {
  flint.debug('Flint listening on port %s', config.port);
});

// Gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});
