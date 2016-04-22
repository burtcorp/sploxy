# Sploxy

A proxy between various AWS services and Slack.

## Preparations

To use Sploxy you will first need to create an IAM role to use as execution role for the Lambda function and a Slack API token.

### Setting up IAM

Create an IAM role and give it a good name. You will need to create it with an "trust relationship policy" that allows AWS Lambda to use this role when executing the Sploxy Lambda function. The required policy document is availabe in `config/policies/assume-role-policy.json`

```console
$ aws iam create-role \
  --role-name "sploxy" \
  --assume-role-policy-document file://config/policies/assume-role-policy.json
```

If you want the Lamdba function to log to CloudWatch logs you need to give it permission to do that. There's an policy for that in `config/policies/logging.json`, and you can add it to the role like this:

```console
$ aws iam put-role-policy \
  --role-name "sploxy" \
  --policy-name "logging" \
  --policy-document file://config/policies/logging.json
```

Make sure to use the same name as when you created the role.

If you want to encrypt your Slack API token (see below for why you would want to do this) you will also need to create a KMS key. This is easier to do through the web console than the command line tools because it requires selecting administrator users, and a few other things. When you have a KMS key copy `config/policies/decrypt.json.example` to `config/policies/decrypt.json` and edit it so that the resource list includes the ARN of the KMS key you created. After that you can give your Lambda execution role permissions to decrypt using the key like this:

```console
$ aws iam put-role-policy \
  --role-name "sploxy" \
  --policy-name "decrypt" \
  --policy-document file://config/policies/decrypt.json
```

### Configuring Sploxy

Copy `config/config.json.example` to `config/config.json` and edit the file.

As a minimum you need a Slack API token to use Sploxy. If you're fine with storing it as plain text you can edit the config file to look like this:

```json
{
  "slackApiToken": "xoxo-helloworldapitoken"
}
```

However, if you want some more security you should encrypt the token and use AWS KMS and IAM to control access to it. See below for how to encrypt your token.

To use an encrypted token you also need to tell KMS which region you're running in:

```json
{
  "aws": {
    "region": "eu-west-1"
  },
  "slackApiToken": {
    "encrypted": "dGhpcyBpcyBub3QgYSByZWFsIFNsYWNrIHRva2VuCg=="
  }
}
```

### Encrypt the Slack API token with KMS

Make sure the IAM user you are using to run this command has permissions to encrypt using the KMS key you created above, then run

```console
$ aws kms encrypt --key-id arn:aws:kms:eu-west-1:1234567890:key/abcdef-ghijk-1234-5678-9101112 --plaintext xoxo-helloworldapitoken --query CiphertextBlob --output text
```

But use the ARN of the KMS key you created above, and pass your Slack API token as the plaintext. Copy the output into `config/config.json`.

## Deploying to Lambda

Once you've set up the IAM permissions and created your configuration you can create the Lambda function like this:

```console
$ make create
```

You can now test that it works by creating a simple message file and invoking the Lambda function with it as input:

```console
$ echo '{"channel": "#general","text": "Hello world"}' > message.json
$ aws lambda invoke-async --function-name sploxy --invoke-args message.json
```

You should see a message in your #general channel momentarily. If you don't you can invoke the function synchronously to see if its output gives you any indication as to what might have gone wrong:

```console
$ aws lambda invoke --function-name sploxy --payload file://message.json sploxy.out
$ cat sploxy.out
```

## Connecting AWS services

### SNS

There doesn't seem to be any way to subscribe a Lambda function to an SNS topic using the command line tools, so this is easiest done through the SNS web console. Create a topic in the same region as the Lambda function, and choose Create Subscription. In the dialog that appears you should be able to select "AWS Lambda" as protocol, and then the right Lambda function in the dropdown below.

Once you've created the topic and set up the subscription you can try it out like this, assuming you still have the `message.json` file you created when you tried invoking the function directly:

```console
$ aws sns publish --topic-arn arn:aws:sns:eu-west-1:1234567890:sploxy --message file://message.json
```

# Copyright

© 2014-2015 Burt AB, see LICENSE.txt (BSD 3-Clause).
