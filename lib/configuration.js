"use strict"

var fs = require("fs")
var aws = require("@aws-sdk/client-kms")

function loadConfigFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

function decryptString(string, awsConfig, options) {
  let kmsConstructor = (options && options.kmsConstructor) || aws.KMS
  let kms = new kmsConstructor(awsConfig)
  return new Promise((resolve, reject) => {
    let params = {CiphertextBlob: new Buffer(string, "base64")}
    kms.decrypt(params, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.Plaintext.toString('utf-8'))
      }
    })
  })
}

exports.load = function (path, options) {
  return loadConfigFile(path).catch((error) => ({})).then((config) => {
    if (config.slackApiToken && config.slackApiToken.encrypted) {
      return decryptString(config.slackApiToken.encrypted, config.aws, options).then((slackApiToken) => {
        config.slackApiToken = slackApiToken
        return config
      })
    } else if (!config.slackApiToken && process.env.SLACK_API_TOKEN) {
      config.slackApiToken = process.env.SLACK_API_TOKEN
      return config
    } else {
      return config
    }
  })
}
