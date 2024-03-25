import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { AwsProvider, Instance, SecurityGroup, File } from './.gen/providers/aws';

class MidtermStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: 'us-east-1' 
    });

    const securityGroup = new SecurityGroup(this, 'website-sg', {
      name: 'website-sg',
      description: 'Allow HTTP traffic',
      tags: {
        Name: 'website-sg'
      }
    });

    securityGroup.addIngressRule('http', {
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0']
    });

    const webServer = new Instance(this, 'web-server', {
      ami: 'ami-0c55b159cbfafe1f0', 
      instanceType: 't2.micro',
      securityGroups: ['website-sg'],
      tags: {
        Name: 'Midterm-EC2-Website'
      },
      userData: `
        #!/bin/bash
        yum update -y
        yum install -y nodejs npm
        mkdir /var/www/html
        cd /var/www/html
        echo "<html><body><h1>Welcome to My EC2 Website!</h1></body></html>" > index.html
        npm install http-server -g
        nohup http-server &
      `,
    });

    new File(this, 'index.html', {
      path: '/cdk-ec2-website/index.html',
      provisioner: [{
        dependsOn: [webServer], 
      }],
    });
  }
}

const app = new App();
new MidtermStack(app, 'Midterm-EC2-Website');
app.synth();
