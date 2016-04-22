"use strict"

var slack = require("./slack")
var extractMessage = require("./message-extractor").extractMessage
var configuration = require("./configuration")

exports.handler = function (event, context, callback) {
  Promise.all([
    configuration.load("config/config.json"),
    extractMessage(event)
  ]).then((values) => {
    let configuration = values[0]
    let message = values[1]
    return slack.create(configuration.slackApiToken).postMessage(message)
  }).then(
    (response) => callback(null, response),
    (error) => callback(error)
  )
}
