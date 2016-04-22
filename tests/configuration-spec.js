"use strict"

var chai = require("chai")
var fs = require("fs")
var temp = require("temp")
var configuration = require("../lib/configuration")
var expect = chai.expect

temp.track();

describe("Configuration", () => {
  describe("load", () => {
    describe("when there no configuration file", () => {
      it("returns an empty configuration", () => {
        return configuration.load("this-file-does-not-exist.json").then((conf) => {
          expect(conf).to.deep.eq({})
        })
      })

      describe("and the environment variable SLACK_API_TOKEN is set", () => {
        beforeEach(() => {
          process.env.SLACK_API_TOKEN = "TOKEN"
        })

        afterEach(() => {
          delete process.env.SLACK_API_TOKEN
        })

        it("sets the slackApiToken config property to the value of the environment variable", () => {
          return configuration.load("this-file-does-not-exist.json").then((conf) => {
            expect(conf.slackApiToken).to.eq("TOKEN")
          })
        })
      })
    })

    describe("when there is a configuration file", () => {
      let configurationPath = temp.path()
      let writtenConf = {
        hello: "world",
        slackApiToken: "TOKEN",
        aws: {
          region: "eu-north-3"
        }
      }

      let writeConfig = () => {
        fs.writeFileSync(configurationPath, JSON.stringify(writtenConf))
      }

      beforeEach(() => writeConfig())

      afterEach(() => fs.unlinkSync(configurationPath))

      it("reads the configuration from the file", () => {
        return configuration.load(configurationPath).then((conf) => {
          expect(conf).to.deep.eq(writtenConf)
        })
      })

      describe("and the environment variable SLACK_API_TOKEN is set", () => {
        beforeEach(() => {
          process.env.SLACK_API_TOKEN = "BROKEN"
        })

        afterEach(() => {
          delete process.env.SLACK_API_TOKEN
        })

        it("uses the slackApiToken from the configuration file and not the environment variable", () => {
          return configuration.load(configurationPath).then((conf) => {
            expect(conf.slackApiToken).to.eq("TOKEN")
          })
        })
      })

      describe("and there is an encrypted Slack API token in the configuration", () => {
        let fakeKms = null
        let fakeKmsFactory = null
        let decryptParameters = null
        let decryptError = null
        let decryptResponseData = new Buffer("TOKEN")

        beforeEach(() => {
          fakeKmsFactory = function (params) {
            fakeKms = this
            this.params = params
            this.decrypt = (params, callback) => {
              decryptParameters = params
              callback(decryptError, {Plaintext: decryptResponseData})
            }
          }
        })

        beforeEach(() => {
          delete writtenConf.slackApiToken
          writtenConf.slackApiToken = {encrypted: "RU5DUllQVEVEVE9LRU4="}
          writeConfig()
        })

        it("uses KMS to decrypt the string", () => {
          return configuration.load(configurationPath, {kmsConstructor: fakeKmsFactory}).then((conf) => {
            expect(decryptParameters.CiphertextBlob.toString()).to.eq("ENCRYPTEDTOKEN")
            expect(conf.slackApiToken).to.eq("TOKEN")
          })
        })

        it("configures KMS to use the region from the config file", () => {
          return configuration.load(configurationPath, {kmsConstructor: fakeKmsFactory}).then((conf) => {
            expect(fakeKms.params).to.deep.eq({region: "eu-north-3"})
          })
        })
      })
    })
  })
})
