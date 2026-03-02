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
        TASK_FAMILY = "user-service1"
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Login ECR') {
            steps {
                sh '''
                set -euxo pipefail

                aws ecr get-login-password --region $AWS_REGION | \
                docker login --username AWS \
                --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                set -euxo pipefail

                docker build -t $ECR_REPO:$IMAGE_TAG .

                docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
                docker push $ECR_URI:$IMAGE_TAG
                '''
            }
        }

        stage('Create NEW Task Revision') {
            steps {
                sh '''
                set -euxo pipefail

                echo "Getting ACTIVE task definition ARN..."

                TASK_ARN=$(aws ecs list-task-definitions \
                  --family-prefix $TASK_FAMILY \
                  --sort DESC \
                  --max-items 1 \
                  --region $AWS_REGION \
                  --query "taskDefinitionArns[0]" \
                  --output text)

                echo "Current ARN: $TASK_ARN"

                aws ecs describe-task-definition \
                  --task-definition $TASK_ARN \
                  --region $AWS_REGION \
                  > task-def.json

                jq --arg IMAGE "$ECR_URI:$IMAGE_TAG" '
                  .taskDefinition
                  | del(
                      .taskDefinitionArn,
                      .revision,
                      .status,
                      .requiresAttributes,
                      .compatibilities,
                      .registeredAt,
                      .registeredBy
                    )
                  | .containerDefinitions[0].image = $IMAGE
                ' task-def.json > new-task.json

                aws ecs register-task-definition \
                  --region $AWS_REGION \
                  --cli-input-json file://new-task.json \
                  > output.json

                jq -r '.taskDefinition.revision' output.json > revision.txt
                '''
            }
        }

        stage('Deploy New Revision') {
            steps {
                sh '''
                set -euxo pipefail

                REVISION=$(cat revision.txt)

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
            sh 'docker image prune -f'
        }
    }
}
