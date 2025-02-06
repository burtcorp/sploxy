"use strict"

const { WebClient } = require('@slack/web-api');

exports.create = function (apiToken, options) {
  const slackConstructor = (options && options.slackConstructor) || WebClient
  const slackClient = new slackConstructor(apiToken)
  const self = {}

  self.postMessage = async (message) => {
    return await slackClient.chat.postMessage(message)
  }

  return self
}
