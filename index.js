var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhooks', function (req, res) {
  console.log(req.query)
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

app.post('/webhooks', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

    if (payload) {
      contextPayloadMatcher(senderID, payload)
    } else {
      sendTextMessage(senderID, "OK, mate, not sure what you mean");
    }
}


function contextPayloadMatcher(senderID, payload){
  switch(payload){
    case 'Lets get in touch':
      sendIntroMessage(senderID);
      break;
    case 'wherefrom':
      sendGenericMessage(senderID);
      break;
    case 'information':
      sendQuickFacts(senderID);
      break;
    case 'yourstory':
      setTimeout(function() {
          sendTextMessage(senderID, "Where to start ...");
      }, 500)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media.giphy.com/media/W8JIqASjSwtcA/giphy.gif")
      }, 3000)
      setTimeout(function() {
        sendTextMessage(senderID, "Philip grew up in sunny Sydney, Australia before making the move over to New York in September 2016");
      }, 5500)
      setTimeout(function() {
        sendTextMessage(senderID, "He studied Media & Communications at Macquarie University and worked as a journalist before realising his true calling lied elsewhere");
      }, 8500)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media.giphy.com/media/MGdfeiKtEiEPS/giphy.gif")
      }, 10000)

      break;
    default:
      sendGenericMessage(senderID);
  }
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    contextMessageMatcher(senderID, messageText)
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Um, sure ... thanks for that");
  }
}

function contextMessageMatcher(senderID, messageText){
  switch(true){
    case /generic/.test(messageText):
      setTimeout(function(){
        sendGenericMessage(senderID);
      }, 2000);
    ;
      break;
    case /experience/.test(messageText):
      sendGenericMessage(senderID);
      break;
    default:
      sendTextMessage(senderID, messageText);
  }
}

function sendIntroMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "What would you like to know?",
          buttons: [
            {
              type: "postback",
              title: "What's his story?",
              payload: "yourstory"
            },
            {
              type: "postback",
              title: "What can PhilBot do?",
              payload: "yourstory"
            },
            {
              type: "postback",
              title: "Get the facts",
              payload: "information"
            }
          ]
        }
      }
    }
  }

  setTimeout(function() {
    sendTextMessage(recipientId, "I'm PhilBot 😄, the personal bot made to answer your questions about Phil.")
  }, 500)
  setTimeout(function() {
    callSendAPI(messageData);
  }, 2500)
}


function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble"
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendQuickFacts(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Education",
              subtitle: "Phil's Education History Phil's Education History Phil's Education History Phil's Education History Phil's Education History Phil's Education History ",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [
                {
                type: "postback",
                title: "Tell me more",
                payload: "Payload for first bubble",
                }
              ],
            },
            {
              title: "Work Experience",
              subtitle: "Phil's Work Experience",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/touch/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for second bubble"
              }]
            },
            {
              title: "Portfolio",
              subtitle: "Phil's Portfolio",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/touch/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for second bubble"
              }]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendTextWithImage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl
        }
      }
    }
  };
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
