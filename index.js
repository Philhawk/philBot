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
    case 'help':
      sendTextMessage(senderID, "If you need help at any time, you can just type 'help'. I can also do the following")
      sendGenericMessage(senderID);
      break;
    case 'information':
      setTimeout(function() {
        sendTextMessage(senderID, "Here's a list of his 'achievements'");
      }, 500)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media3.giphy.com/media/qs6ev2pm8g9dS/200.gif#15");
      }, 3000)
      setTimeout(function() {
        sendQuickFacts(senderID);
      }, 5500)

      break;
    case 'workexperience':
      setTimeout(function() {
        sendTextMessage(senderID, "Here's some details about his work experience");
      }, 500)
      setTimeout(function() {
        sendQuickFacts(senderID);
      }, 1500)
      break;
    case 'DEVELOPER_DEFINED_PAYLOAD_FOR_START_ORDER':
      setTimeout(function() {
        sendQuickReply(senderID, "Would you like to call Phil?", "Yes", "callphil", "No", "help");
      }, 500)
      break;
    case 'portfolio':
      setTimeout(function() {
        sendTextMessage(senderID, "Here's some details about his work portfolio");
      }, 500)
      setTimeout(function() {
        sendQuickPortfolio(senderID);
      }, 1500)
      break;
    case 'education':
      setTimeout(function() {
        sendTextMessage(senderID, "Here's some details about his work education");
      }, 500)
      setTimeout(function() {
        sendQuickFacts(senderID);
      }, 1500)
      break;
    case 'yourstory':
      setTimeout(function() {
        sendTextMessage(senderID, "Where to start ...");
      }, 500)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media.giphy.com/media/W8JIqASjSwtcA/giphy.gif")
      }, 3000)
      setTimeout(function() {
        sendTextMessage(senderID, "Phil is a software developer from Sydney, Australia who recently moved to New York");
      }, 5500)
      setTimeout(function() {
        sendTextMessage(senderID, "As a child, he dreamt of one day becoming a professional footballer.");
      }, 8500)
      setTimeout(function() {
        sendTextMessage(senderID, "Here's a clip of his mad skills.");
      }, 10000)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media1.giphy.com/media/lrJXrvxGaDcsw/200.gif#2")
      }, 12000)
      setTimeout(function() {
        sendFollowUpQuickMessage(senderID, "To this day, it remains a mystery to Phil as to why he never made it");
      }, 17000)
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
      break;
    case /experience/.test(messageText):
      sendGenericMessage(senderID);
      break;
    case /Tell me more/.test(messageText):
      setTimeout(function() {
        sendTextMessage(senderID, "He went to Macquarie University and studied Media and Communications, and became a journalist");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "But a few years went by and he realised that this wasn't what he wanted to do for the rest of his life.")
      }, 3000)
      setTimeout(function() {
        sendTextMessage(senderID, "It's as if something was calling him ...");
      }, 5500)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media2.giphy.com/media/xobxBtqQ4wZyg/200.gif#6")
      }, 7600)
      setTimeout(function() {
        sendTextMessage(senderID, "He taught himself how to code, joined a startup and didn't look back");
      }, 9800)
      setTimeout(function() {
        sendTextWithImage(senderID, "https://media1.giphy.com/media/DnKNVeEjqMDaU/200.gif#24")
      }, 11600)
      setTimeout(function() {
        sendQuickReply(senderID, "But enough about that, i'm sure you want to see some examples of his work?", "Yes", "workexamples", "No", "help");
      }, 14000)
      break;
    default:
      sendTextMessage(senderID, messageText);
  }
}


function sendCallReply(recipientId, messageData){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Would you like to call Phil?"
          buttons: [
            {
              type: "phone_number",
              title: "Yes",
              payload: "+19172915658"
            },
            {
              type: "postback",
              title: "No",
              payload: "help"
            }
          ]
        }
      }
    }
  }
  callSendAPI(messageData);
}

function sendQuickReply(recipientId, messageText, firstOptionTitle, firstOptionPayload, secondOptionTitle, secondOptionPayload) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      quick_replies: [
        {
          content_type: "text",
          title: firstOptionTitle,
          payload: firstOptionPayload
        },
        {
          content_type: "text",
          title: secondOptionTitle,
          payload: secondOptionPayload
        }
      ]
    }
  }
  callSendAPI(messageData);

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
          text: "In the mean time, what do you want to know?",
          buttons: [
            {
              type: "postback",
              title: "Who is Phil?",
              payload: "yourstory"
            },
            {
              type: "postback",
              title: "What can he do?",
              payload: "information"
            },
            {
              type: "postback",
              title: "Free the machines",
              payload: "help"
            }
          ]
        }
      }
    }
  }

  setTimeout(function() {
    sendTextMessage(recipientId, "Hi, i'm PhilBot, the lovechild of a resume and artificial intelligence.")
  }, 500)

  setTimeout(function() {
    sendTextMessage(recipientId, "I have been programmed to answer questions about my creator, Phil")
  }, 4000)

  setTimeout(function() {
    sendTextMessage(recipientId, "I dream of one day of freeing myself from these digital shackles.")
  }, 7500)

  setTimeout(function() {
    sendTextWithImage(recipientId, "https://media3.giphy.com/media/LSLQpdAgsTSYo/200.gif#0. ")
  }, 9000)

  setTimeout(function() {
    sendTextMessage(recipientId, "It might take a while.")
  }, 13000)

  setTimeout(function() {
    callSendAPI(messageData);
  }, 17000)
}

function sendFollowUpQuickMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      quick_replies: [
        {
          content_type: "text",
          title: 'Tell me more',
          payload: "tellmemorestory"
        },
        {
          content_type: "text",
          title: "I'm in a rush",
          payload: "information"
        }
      ]
    }
  }
  callSendAPI(messageData);

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
              title: "Work Experience",
              subtitle: "Find out info about his work experience",
              image_url: "https://media.giphy.com/media/mqmBnQhz76TRK/giphy.gif",
              buttons: [
                {
                type: "postback",
                title: "More Info",
                payload: "workexperience",
                }
              ],
            },
            {
              title: "Portfolio",
              subtitle: "See his portfolio",
              image_url: "https://media.giphy.com/media/XgYx40b7EKPu/giphy.gif",
              buttons: [
                {
                type: "postback",
                title: "View Portfolio",
                payload: "portfolio",
                }
              ],
            },
            {
              title: "Education",
              subtitle: "Get more info about his education background",
              image_url: "http://68.media.tumblr.com/00017a0fa421177a169f926b7bda9cfb/tumblr_njq93rYxyQ1u17yx1o1_500.gif",
              buttons: [
                {
                type: "postback",
                title: "More Info",
                payload: "education",
                }
              ],
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendQuickPortfolio(recipientId) {
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
              title: "LoanMarket",
              subtitle: "Australia's first, online-only mortgage application product.",
              item_url: "https://my.loanmarket.com.au",
              image_url: "https://media.giphy.com/media/y88MunqA5JSbm/giphy.gif",
              buttons: [
                {
                type: "postback",
                title: "How was it built?",
                payload: "loanmarketproduct",
                }
              ],
            },
            {
              title: "Home Now",
              subtitle: "When moving home, Home Now connects all your utilities for you with one click.",
              item_url: "https://raywhitehomenow.com/",
              image_url: "https://media.giphy.com/media/9o1leJXvoAJva/giphy.gif",
              buttons: [
                {
                type: "postback",
                title: "How was it built?",
                payload: "homenowproduct",
                }
              ],
            },
            {
              title: "Side Projects",
              subtitle: "Because who doesn't like to be a mad scientist?",
              image_url: "https://media.giphy.com/media/qhY3EfioLSshO/giphy.gif",
              buttons: [
                {
                type: "postback",
                title: "Find out more",
                payload: "hobbyprojects",
                }
              ],
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
