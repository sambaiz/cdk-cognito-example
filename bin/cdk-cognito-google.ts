#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkCognitoGoogleStack } from '../lib/cdk-cognito-google-stack';

const app = new cdk.App();
new CdkCognitoGoogleStack(app, 'CdkCognitoGoogleStack');
