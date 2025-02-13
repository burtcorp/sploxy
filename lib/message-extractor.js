"use strict"

exports.extractMessage = async function(event) {
  const record = event && event.Records && event.Records[0]
  if (record && record.EventSource == "aws:sns") {
    return JSON.parse(event.Records[0].Sns.Message)
  } else {
    return event
  }
}