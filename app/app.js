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

// Help fct
help = function() {
  var help  = '**Translate** \n\n';
  help += '_Description_ : Text translation online via chat bot \n\n';
  help += '_Commands_ : [lang in] [lang out] [*/phrase] \n\n';
  help += '* fr I like it! \n\n';
  help += '* fr ge j\'ai un rendez-vous demain \n\n';
  help += '_lang_: \n\n* en\n\n* es\n\n* fr\n\n* ge \n\n';
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

// Help fct
flint.hears(/^help.*/i, function(bot, trigger) {
  bot.say(help());
});

// Test
flint.hears(/^test .*/i, function(bot, trigger) {
  console.log('>>> trigger.args:' + trigger.args);
  bot.say(trigger.args);
});

// Import translate functions
flint.hears(/.*/i, function(bot, trigger) {
    var phrase = '';
    var langIn = trigger.args['0'];
    var langOut = trigger.args['1'];
    for (i = 2; i < trigger.args.length; i++) {
      phrase += ' '+trigger.args[i];
    }
    console.log('langIn:'+langIn+', phraseIn:'+phrase);

    translate({
      text: phrase,
      source: langIn,
      target: langOut
    }, function(result) {
      console.log('langOut:' + langOut + ', phraseOut:' + result);
      bot.say(result);
    });

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
