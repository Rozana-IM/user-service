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

        // ================= CHECKOUT =================
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ================= LOGIN TO ECR =================
        stage('Login ECR') {
            steps {
                sh '''
                #!/bin/bash
                set -eux

                aws ecr get-login-password --region $AWS_REGION | \
                docker login --username AWS \
                --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        // ================= BUILD & PUSH =================
        stage('Build & Push Image') {
            steps {
                sh '''
                #!/bin/bash
                set -eux

                echo "Building Docker image..."

                docker build -t $ECR_REPO:$IMAGE_TAG .

                docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
                docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:latest

                echo "Pushing BUILD image..."
                docker push $ECR_URI:$IMAGE_TAG

                echo "Updating latest tag..."
                docker push $ECR_URI:latest
                '''
            }
        }

        // ================= CREATE NEW TASK REVISION =================
        stage('Create NEW Task Revision') {
            steps {
                sh '''
                #!/bin/bash
                set -eux

                echo "Downloading existing task definition..."

                aws ecs describe-task-definition \
                  --task-definition $TASK_FAMILY \
                  --region $AWS_REGION \
                  > task-def.json

                echo "Injecting new image..."

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
                        if .name == "user-service1"
                        then .image = $IMAGE
                        else .
                        end
                    )
                ' task-def.json > new-task-def.json

                echo "Registering new revision..."

                aws ecs register-task-definition \
                  --region $AWS_REGION \
                  --cli-input-json file://new-task-def.json \
                  > task-output.json

                jq -r '.taskDefinition.revision' task-output.json > revision.txt
                '''
            }
        }

        // ================= DEPLOY NEW REVISION =================
        stage('Deploy New Revision') {
            steps {
                sh '''
                #!/bin/bash
                set -eux

                REVISION=$(cat revision.txt)

                echo "Deploying revision $REVISION"

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
