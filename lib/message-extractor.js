"use strict"

exports.extractMessage = function (event) {
  let record = event && event.Records && event.Records[0]
  if (record && record.EventSource == "aws:sns") {
    return Promise.resolve(JSON.parse(event.Records[0].Sns.Message))
  } else {
    return Promise.resolve(event)
  }
}