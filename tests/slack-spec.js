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
    let postMessageArgument = null
    let responsePromise = null

    beforeEach(() => {
      responsePromise = Promise.resolve({this: {is: {the: "response"}}})
      fakeSlackClient.chat.postMessage = (message) => {
        postMessageArgument = message
        return responsePromise
      }
    })

    it("passes the message through the data parameter of chat.postMessage", () => {
      return client.postMessage({foo: "bar"}).then(() => {
        expect(postMessageArgument).to.deep.eq({foo: "bar"})
      })
    })

    it("returns the response of the chat.postMessage call", () => {
      return client.postMessage({}).then((response) => {
        expect(response).to.deep.eq({this: {is: {the: "response"}}})
      })
    })

    describe("when the request fails", () => {
      beforeEach(() => {
        responsePromise = Promise.reject("b0rk")
      })

      it("fails with the error from the chat.postMessage call", () => {
        return client.postMessage({}).catch((error) => {
          expect(error).to.eq("b0rk")
        })
      })
    })
  })
})
