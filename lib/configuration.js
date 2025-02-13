"use strict"

var fs = require("fs")
var aws = require("@aws-sdk/client-kms")

async function loadConfigFile(path) {
  const data = await fs.promises.readFile(path)
  return JSON.parse(data)
}

async function decryptString(string, awsConfig, options) {
  const kmsConstructor = (options && options.kmsConstructor) || aws.KMS
  const kms = new kmsConstructor(awsConfig)
  const params = { CiphertextBlob: Buffer.from(string, "base64") }
  const response = await kms.decrypt(params)
  return response.Plaintext.toString('utf-8')
}

exports.load = async function(path, options) {
  let config
  try {
    config = await loadConfigFile(path)
  } catch (error) {
    config = {}
  }
  if (config.slackApiToken && config.slackApiToken.encrypted) {
    const slackApiToken = await decryptString(config.slackApiToken.encrypted, config.aws, options)
    config.slackApiToken = slackApiToken
  } else if (!config.slackApiToken && process.env.SLACK_API_TOKEN) {
    config.slackApiToken = process.env.SLACK_API_TOKEN
  }
  return config
}
