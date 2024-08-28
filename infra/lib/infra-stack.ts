import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC の作成
    const vpc = new ec2.Vpc(this, "DockerPipelineScriptVpc", {
      maxAzs: 2, // アベイラビリティゾーンの数
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // ECR リポジトリの作成
    const controllerRepository = new ecr.Repository(
      this,
      "DockerPipelineControllerEcrRepository",
      {
        repositoryName: "docker-pipeline-controller-ecr-repository",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
    const converterRepository = new ecr.Repository(
      this,
      "DockerPipelineConverterEcrRepository",
      {
        repositoryName: "docker-pipeline-converter-ecr-repository",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // ECS クラスターの作成
    const cluster = new ecs.Cluster(this, "DockerPipelineEcsCluster", {
      vpc: vpc,
      containerInsights: true, // Container Insights を有効にする なくてもよいかも？
    });

    // タスク実行ロールの作成 (タスクの実行に必要)
    const taskExecutionRole = new iam.Role(this, "TaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // タスク実行ロールにCloudWatchとECRへのアクセス権限を付与
    taskExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );

    // タスクロールの作成 (コンテナ内でのAWSリソースアクセスに必要)
    const taskRole = new iam.Role(this, "MyTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // タスクロールにS3フルアクセスの権限を付与
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // EC2 インスタンスの作成 (パブリックサブネットを指定)
    const autoScalingGroup = cluster.addCapacity(
      "DockerPipelineGroupCapacity",
      {
        instanceType: new ec2.InstanceType("c3.large"),
        desiredCapacity: 0,
        minCapacity: 0,
        maxCapacity: 1,
        keyName: "mp4-converter-cluster",
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      }
    );
    const securityGroup = new ec2.SecurityGroup(
      this,
      "AllTrafficSecurityGroup",
      {
        vpc: vpc,
        allowAllOutbound: true, // 全てのアウトバウンドトラフィックを許可
      }
    );

    // 全てのインバウンドトラフィックを許可
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow all inbound IPv4 traffic"
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.allTraffic(),
      "Allow all inbound IPv6 traffic"
    );

    // Auto Scaling Groupにセキュリティグループを適用
    autoScalingGroup.addSecurityGroup(securityGroup);
    // Auto Scaling Groupをキャパシティープロバイダーとして追加
    const capacityProvider = new ecs.AsgCapacityProvider(
      this,
      "AsgCapacityProvider",
      {
        autoScalingGroup,
      }
    );
    cluster.addAsgCapacityProvider(capacityProvider);

    // デフォルトキャパシティープロバイダー戦略の設定
    cluster.addDefaultCapacityProviderStrategy([
      {
        capacityProvider: capacityProvider.capacityProviderName,
        weight: 1,
      },
    ]);

    // タスク定義の作成
    const taskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "DockerPipelineTaskDef",
      {
        taskRole: taskRole,
        executionRole: taskExecutionRole,
      }
    );

    // タスク定義のバインドマウントの設定
    const volumeName = "docker-pipeline-volume";
    taskDefinition.addVolume({
      name: volumeName,
      // host: {
      //   sourcePath: "/ecs/data",
      // },
    });

    // タスク定義にconverterコンテナを追加
    const converterContainer = taskDefinition.addContainer(
      "ConverterContainer",
      {
        image: ecs.ContainerImage.fromRegistry(
          `${converterRepository.repositoryUri}:latest`
        ),
        memoryLimitMiB: 2048,
        logging: new ecs.AwsLogDriver({
          streamPrefix: "converter",
        }),
      }
    );
    converterContainer.addMountPoints({
      containerPath: "/storage",
      sourceVolume: volumeName,
      readOnly: false,
    });

    // タスク定義にconverterコンテナを追加
    const controllerContainer = taskDefinition.addContainer(
      "ControllerContainer",
      {
        image: ecs.ContainerImage.fromRegistry(
          `${controllerRepository.repositoryUri}:latest`
        ),
        memoryLimitMiB: 512,
        environment: {
          S3_BUCKET_NAME: "docker-rito-sample-bucket",
          S3_INPUT_DIR: "input",
          S3_OUTPUT_DIR: "output",
        },
        logging: new ecs.AwsLogDriver({
          streamPrefix: "controller",
        }),
        essential: true,
      }
    );
    controllerContainer.addMountPoints({
      containerPath: "/storage",
      sourceVolume: volumeName,
      readOnly: false,
    });

    // コンテナ間の依存関係の設定
    controllerContainer.addContainerDependencies({
      container: converterContainer,
      condition: ecs.ContainerDependencyCondition.START,
    });
  }
}
