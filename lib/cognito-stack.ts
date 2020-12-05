import * as cdk from '@aws-cdk/core';
import { UserPool, UserPoolIdentityProviderGoogle, UserPoolClientIdentityProvider, UserPoolClient } from '@aws-cdk/aws-cognito'
import { Secret } from '@aws-cdk/aws-secretsmanager';

interface Props extends cdk.StackProps {
  userPoolName: string
  domainPrefix: string
  googleOauthClientSecretName: string
  clientName: string
  callbackUrls: string[]
}

export class CognitoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props)

    const userPool = this.createUserPool(props.userPoolName, props.domainPrefix)
    this.createIdentityProviderGoogle(userPool, props.googleOauthClientSecretName)
    const client = this.createUserPoolClient(userPool, props.clientName, props.callbackUrls)

    new cdk.CfnOutput(this, 'AuthorizeURLOutput', {
      value: `https://${props.domainPrefix}.auth.${this.region}.amazoncognito.com/authorize?client_id=${client.userPoolClientId}&redirect_uri=${encodeURIComponent(props.callbackUrls[0])}&response_type=code&identity_provider=Google`,
    })
  }

  private createUserPool(userPoolName: string, domainPrefix: string): UserPool {
    const userPool = new UserPool(this, 'UserPool', {
      userPoolName
    })
    userPool.addDomain("UserPoolDomain", {
      cognitoDomain: {
        // Create OAuth 2.0 Client ID for web application with
        // Authorized JavaScript origins: https://{domainPrefix}.auth.{region}.amazoncognito.com
        // Redirect URI: https://{domainPrefix}.auth.{region}.amazoncognito.com/oauth2/idpresponse
        // at https://console.developers.google.com/apis/credentials and put client_secret.json on SecretsManager
        domainPrefix: "sambaiz-google-auth-test",
      }
    })

    new cdk.CfnOutput(this, 'UserPoolArnOutput', {
      value: userPool.userPoolArn
    })
    new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
      value: `${domainPrefix}.auth.${this.region}.amazoncognito.com`
    })
    return userPool
  }

  private createIdentityProviderGoogle(userPool: UserPool, secretName: string) {
    const oauthClientSecret = Secret.fromSecretNameV2(this, "GoogleOAuthClientSecret", secretName)
    new UserPoolIdentityProviderGoogle(this, "UserPoolIdentityProviderGoogle", {
      userPool,
      clientId: oauthClientSecret.secretValueFromJson('client_id').toString(),
      clientSecret: oauthClientSecret.secretValueFromJson('client_secret').toString(),
      scopes: ["profile", "email"],
    })
  }

  private createUserPoolClient(userPool: UserPool, userPoolClientName: string, callbackUrls: string[]): UserPoolClient {
    const userPoolClient = userPool.addClient("UserPoolClient", {
      userPoolClientName,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        callbackUrls
      }
    })

    new cdk.CfnOutput(this, `UserPoolClientIdOutput`, {
      value: userPoolClient.userPoolClientId
    })
    return userPoolClient
  }

}
