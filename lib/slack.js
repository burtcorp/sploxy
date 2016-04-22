"use strict"

var Slack = require("@slack/client")

exports.create = function (apiToken, options) {
  let slackConstructor = (options && options.slackConstructor) || Slack.WebClient
  let slackClient = new slackConstructor(apiToken)
  let self = {}

  self.postMessage = (message) => {
    return new Promise((resolve, reject) => {
      slackClient.chat.postMessage(null, null, message, (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }

  return self
}
