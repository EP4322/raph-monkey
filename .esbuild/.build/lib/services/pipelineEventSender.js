"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPipelineEvent = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const aws_1 = require("./aws");
const sendPipelineEvent = async (event, smokeTest = false) => {
    const snsResponse = await aws_1.sns.send(new client_sns_1.PublishCommand({
        Message: JSON.stringify(event),
        ...(smokeTest && {
            MessageAttributes: {
                SmokeTest: {
                    DataType: 'String',
                    StringValue: 'true',
                },
            },
        }),
        TopicArn: 'Blah',
    }));
    if (snsResponse.MessageId === undefined) {
        throw Error('SNS did not return a message ID');
    }
    return snsResponse.MessageId;
};
exports.sendPipelineEvent = sendPipelineEvent;
//# sourceMappingURL=pipelineEventSender.js.map