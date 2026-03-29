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
        set -eux
        
        docker system prune -af
        
        echo "Building Docker image..."
        docker build --no-cache -t user-service:${BUILD_NUMBER} .
        
        docker tag user-service:${BUILD_NUMBER} 789890001348.dkr.ecr.us-east-1.amazonaws.com/user-service:${BUILD_NUMBER}
        
        docker push 789890001348.dkr.ecr.us-east-1.amazonaws.com/user-service:${BUILD_NUMBER}
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
                        if .name == "user-service"
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
