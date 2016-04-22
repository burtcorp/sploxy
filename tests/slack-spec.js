"use strict"

var chai = require("chai")
var slack = require("../lib/slack")
var expect = chai.expect

describe("Slack", () => {
  let client = null
  let fakeSlackClient = null

  beforeEach(() => {
    let fakeSlackClientFactory = function (token) {
      fakeSlackClient = this
      this.apiToken = token
      this.chat = {}
    }
    client = slack.create("TOKEN", {slackConstructor: fakeSlackClientFactory})
  })

  describe("create", () => {
    it("creates a Slack client with the specified API token", () => {
      expect(fakeSlackClient.apiToken).to.eq("TOKEN")
    })
  })

  describe("postMessage", () => {
    let postMessageArguments = null
    let responseResult = null
    let responseError = null

    beforeEach(() => {
      responseResult = null
      responseError = null
      fakeSlackClient.chat.postMessage = (channel, message, data, callback) => {
        postMessageArguments = [channel, message, data, callback]
        callback(responseError, responseResult)
      }
    })

    it("passes the message through the data parameter of chat.postMessage", () => {
      return client.postMessage({foo: "bar"}).then(() => {
        expect(postMessageArguments[2]).to.deep.eq({foo: "bar"})
      })
    })

    it("ignores the channel and message parameters to chat.postMessage", () => {
      return client.postMessage({}).then(() => {
        expect(postMessageArguments[0]).to.be.null
        expect(postMessageArguments[1]).to.be.null
      })
    })

    it("returns the response of the chat.postMessage call", () => {
      responseResult = {this: {is: {the: "response"}}}
      return client.postMessage({}).then((response) => {
        expect(response).to.deep.eq({this: {is: {the: "response"}}})
      })
    })

    describe("when the request fails", () => {
      beforeEach(() => {
        responseError = "b0rk"
      })

      it("fails with the error from the chat.postMessage call", () => {
        return client.postMessage({}).catch((error) => {
          expect(error).to.eq("b0rk")
        })
      })
    })
  })
})
