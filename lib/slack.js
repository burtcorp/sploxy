"use strict"

const { WebClient } = require('@slack/web-api');

exports.create = function (apiToken, options) {
  let slackConstructor = (options && options.slackConstructor) || WebClient
  let slackClient = new slackConstructor(apiToken)
  let self = {}

  self.postMessage = (message) => {
    return slackClient.chat.postMessage(message);
  }

  return self
}
