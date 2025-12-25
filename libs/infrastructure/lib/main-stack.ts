import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1. Define the core networking infrastructure (VPC)
    const vpc = new ec2.Vpc(this, 'CabiVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // 2. Define the primary database resource (RDS for PostgreSQL)
    const dbInstance = new rds.DatabaseInstance(this, 'CabiDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      databaseName: 'cabi',
    });

    // 3. Define a Cognito User Pool for authentication
    const userPool = new cognito.UserPool(this, 'CabiUserPool', {
      userPoolName: 'cabi-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // 4. Define the API Gateway Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CabiApiAuthorizer',
      {
        cognitoUserPools: [userPool],
      }
    );

    // 5. Define the API Gateway resource with default auth
    const api = new apigateway.RestApi(this, 'CabiApiGateway', {
      restApiName: 'Cabi Service Gateway',
      description: 'The single entry point for all Cabi backend services.',
      defaultMethodOptions: {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    });

    // 6. Define API Gateway Usage Plan for rate limiting
    const usagePlan = api.addUsagePlan('CabiUsagePlan', {
      name: 'CabiDefaultUsagePlan',
      throttle: {
        rateLimit: 100, // requests per second
        burstLimit: 50, // concurrent requests
      },
    });

    const apiKey = api.addApiKey('CabiApiKey');
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    // 7. Define CloudWatch Log Groups for each backend service
    const services = [
      'auth-service',
      'user-service',
      'ride-service',
      'payment-service',
      'notification-service',
      'dispatch-service',
    ];
    services.forEach((serviceName) => {
      new logs.LogGroup(this, `${serviceName}LogGroup`, {
        logGroupName: `/cabi/backend/${serviceName}`,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    });

    // 8. Define a basic CloudWatch Dashboard and Alarm for API Gateway errors
    const dashboard = new cloudwatch.Dashboard(this, 'CabiDashboard', {
      dashboardName: 'Cabi-Main-Dashboard',
    });

    const apiGateway5xx = api.metricServerError();

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway 5xx Errors',
        left: [apiGateway5xx],
      })
    );

    const alarmTopic = new sns.Topic(this, 'CabiAlarmTopic');
    const alarm = new cloudwatch.Alarm(this, 'ApiGateway5xxAlarm', {
      metric: apiGateway5xx,
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription: 'High rate of 5xx errors on the main API Gateway',
    });
    alarm.addAlarmAction(new cw_actions.SnsAction(alarmTopic));

    // 9. Define the core Event Bus (SNS Topic)
    const eventBus = new sns.Topic(this, 'CabiEventBus', {
      displayName: 'Cabi Main Event Bus',
      topicName: 'cabi-event-bus',
    });
  }
}