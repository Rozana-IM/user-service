pipeline {
    agent any

    environment {
        AWS_REGION     = "us-east-1"
        AWS_ACCOUNT_ID = "789890001348"

        ECR_REPO  = "user-service"
        ECR_URI   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        IMAGE_TAG = "${BUILD_NUMBER}"

        ECS_CLUSTER = "lucci-cluster"
        ECS_SERVICE = "user-service-service-6jrk52i5"
        TASK_FAMILY = "user-service"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login ECR') {
            steps {
                sh '''
                set -eux
                aws ecr get-login-password --region $AWS_REGION | \
                docker login --username AWS \
                --password-stdin $ECR_URI
                '''
            }
        }

        stage('Build & Push Image') {
            steps {
                sh '''
                set -eux

                echo "🚀 Building image..."
                docker build -t $ECR_URI:$IMAGE_TAG .

                echo "🏷 Tagging latest..."
                docker tag $ECR_URI:$IMAGE_TAG $ECR_URI:latest

                echo "📤 Pushing..."
                docker push $ECR_URI:$IMAGE_TAG
                docker push $ECR_URI:latest
                '''
            }
        }

        stage('Create NEW Task Revision') {
            steps {
                sh '''
                set -eux

                aws ecs describe-task-definition \
                  --task-definition $TASK_FAMILY \
                  --region $AWS_REGION > task-def.json

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
                  | .containerDefinitions |= map(
                        if .name == "user-service"
                        then .image = $IMAGE
                        else .
                        end
                    )
                ' task-def.json > new-task-def.json

                aws ecs register-task-definition \
                  --region $AWS_REGION \
                  --cli-input-json file://new-task-def.json \
                  > task-output.json

                jq -r '.taskDefinition.revision' task-output.json > revision.txt
                '''
            }
        }

        stage('Deploy New Revision') {
            steps {
                sh '''
                set -eux

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
