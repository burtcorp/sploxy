"use strict"

const slack = require("./slack")
const extractMessage = require("./message-extractor").extractMessage
const configuration = require("./configuration")

exports.handler = async function(event, context) {
  const [config, message] = await Promise.all([
    configuration.load("config/config.json"),
    extractMessage(event)
  ])
  const response = await slack.create(config.slackApiToken).postMessage(message)
  return response
}
