import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export class MyCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      cidr: '10.30.0.0/16',
      natGateways: 1,
    });

    // Create a public subnet in the VPC
    const publicSubnet = vpc.publicSubnets[0];

    // Create an EC2 instance in the public subnet
    const ec2Instance = new ec2.Instance(this, 'MyEC2Instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    // Create an SQS FIFO queue
    const queue = new sqs.Queue(this, 'MyQueue', {
      fifo: true, // Set to true for FIFO queue
    });

    // Create an SNS topic
    const topic = new sns.Topic(this, 'MyTopic');

    // Create a secret
    const secret = new secretsmanager.Secret(this, 'MySecret', {
      secretName: 'metrodb-secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'user',
          password: cdk.SecretValue.unsafePlainText('random-password'), // Change to generate random password
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password', // If you want to change the key
      },
    });
  }
}

const app = new cdk.App();
new MyCdkStack(app, 'MyStack');
