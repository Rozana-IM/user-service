pipeline {
    agent any

    environment {
        AWS_REGION     = "us-east-1"
        AWS_ACCOUNT_ID = "249608715148"

        ECR_REPO  = "user-service"
        ECR_URI   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        IMAGE_TAG = "${BUILD_NUMBER}"

        ECS_CLUSTER = "DevCluster"
        ECS_SERVICE = "user-service1-service-8cgwko84"
        TASK_FAMILY = "user-service1-task"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION | \
                docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                docker build -t $ECR_REPO:$IMAGE_TAG .
                docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
                docker push $ECR_URI:$IMAGE_TAG
                '''
            }
        }

        stage('Register NEW Task Definition') {
            steps {
                sh '''
                aws ecs describe-task-definition \
                  --task-definition $TASK_FAMILY \
                  --region $AWS_REGION \
                | jq '.taskDefinition
                    | del(
                        .taskDefinitionArn,
                        .revision,
                        .status,
                        .requiresAttributes,
                        .compatibilities,
                        .registeredAt,
                        .registeredBy
                      )
                    | .containerDefinitions[0].image = "'$ECR_URI':'$IMAGE_TAG'"
                  ' > new-task-def.json

                aws ecs register-task-definition \
                  --region $AWS_REGION \
                  --cli-input-json file://new-task-def.json
                '''
            }
        }

        stage('Deploy EXACT Revision to ECS') {
            steps {
                sh '''
                REVISION=$(aws ecs describe-task-definition \
                  --task-definition $TASK_FAMILY \
                  --region $AWS_REGION \
                  | jq -r '.taskDefinition.revision')

                aws ecs update-service \
                  --cluster $ECS_CLUSTER \
                  --service $ECS_SERVICE \
                  --task-definition $TASK_FAMILY:$REVISION \
                  --region $AWS_REGION
                '''
            }
        }
    }

    post {
        always {
            sh "docker image prune -f"
        }
    }
}
