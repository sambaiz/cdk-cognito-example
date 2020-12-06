#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CognitoStack } from '../lib/cognito-stack';

const app = new cdk.App();
new CognitoStack(app, 'CognitoTestStack', {
    userPoolName: "cdk-cognito-google-test", 
    domainPrefix: "sambaiz-google-auth-test",
    googleOauthClientSecretName: "cdk-cognito-google-test-client-id2",
    clientName: "cdk-cognito-google-test-client-id",
    callbackUrls: ["https://example.com"],
    signUpAllowEmails: ["godgourd@gmail.com"]
});
