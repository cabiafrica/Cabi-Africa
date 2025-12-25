const amplifyconfig = '''{
    "UserAgent": "aws-amplify-cli/2.0",
    "Version": "1.0",
    "auth": {
        "plugins": {
            "awsCognitoAuthPlugin": {
                "UserAgent": "aws-amplify-cli/0.1.0",
                "Version": "0.1.0",
                "IdentityManager": {
                    "Default": {}
                },
                "CredentialsProvider": {
                    "CognitoIdentity": {
                        "Default": {
                            "PoolId": "YOUR_COGNITO_IDENTITY_POOL_ID",
                            "Region": "YOUR_AWS_REGION"
                        }
                    }
                },
                "CognitoUserPool": {
                    "Default": {
                        "PoolId": "YOUR_COGNITO_USER_POOL_ID",
                        "AppClientId": "YOUR_COGNITO_APP_CLIENT_ID",
                        "Region": "YOUR_AWS_REGION"
                    }
                },
                "Auth": {
                    "Default": {
                        "authenticationFlowType": "USER_SRP_AUTH"
                    }
                }
            }
        }
    }
}''';
