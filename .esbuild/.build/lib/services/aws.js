"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sns = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
exports.sns = new client_sns_1.SNSClient({
    apiVersion: '2010-03-31',
});
//# sourceMappingURL=aws.js.map