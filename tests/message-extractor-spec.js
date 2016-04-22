"use strict"

var chai = require("chai")
var messageExtractor = require("../lib/message-extractor")
var expect = chai.expect

describe("MessageExtractor", () => {
  describe("with an SNS event", () => {
    let message = {
      "channel": "#integrations",
      "username": "Le Bot",
      "message": "Hello from SNS"
    }
    let event = {
      "Records":[{
        "EventSource":"aws:sns",
        "EventVersion": "1.0",
        "EventSubscriptionArn": "arn:aws:sns:us-east-1:123456789012:lambda_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
        "Sns":{
          "Type": "Notification",
          "MessageId":"95df01b4-ee98-5cb9-9903-4c221d41eb5e",
          "TopicArn":"arn:aws:sns:us-east-1:123456789012:lambda_topic",
          "Subject":"Test",
          "Message":JSON.stringify(message),
          "Timestamp":"2015-04-02T07:36:57.451Z",
          "SignatureVersion":"1",
          "Signature":"r0Dc5YVHuAglGcmZ9Q7SpFb2PuRDFmJNprJlAEEk8CzSq9Btu8U7dxOu++uU",
          "SigningCertUrl":"http://sns.us-east-1.amazonaws.com/SimpleNotificationService-d6d679a1d18e95c2f9ffcf11f4f9e198.pem",
          "UnsubscribeUrl":"http://cloudcast.amazon.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:123456789012:example_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
          "MessageAttributes":{"key":{"Type":"String","Value":"value"}}
        }
      }]
    }

    it("extracts and deserializes the message from the SNS payload", () => {
      return messageExtractor.extractMessage(event).then((extractedMessage) => {
        expect(extractedMessage).to.deep.eq(message)
      })
    })
  })

  describe("with any other event", () => {
    let event = {foo: "bar"}

    it("returns the whole event", () => {
      return messageExtractor.extractMessage(event).then((message) => {
        expect(message).to.deep.eq(event)
      })
    })
  })
})
