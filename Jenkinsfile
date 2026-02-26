pipeline {
    agent any

    environment {
        AWS_REGION     = "us-east-1"
        AWS_ACCOUNT_ID = "249608715148"

        ECR_REPO    = "user-service"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        ECR_URI     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

        ECS_CLUSTER = "DevCluster"
        ECS_SERVICE = "user-service1-service-8cgwko84"
        TASK_FAMILY = "user-service-task"
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Login to ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} \
                | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Build & Push Image') {
            steps {
                sh """
                docker build -t ${ECR_URI}:${IMAGE_TAG} .
                docker push ${ECR_URI}:${IMAGE_TAG}
                """
            }
        }

        stage('Register New Task Definition') {
            steps {
                sh """
                aws ecs describe-task-definition \
                  --task-definition ${TASK_FAMILY} \
                  --query taskDefinition > task-def.json

                jq '
                  .containerDefinitions[0].image = "${ECR_URI}:${IMAGE_TAG}" |
                  del(
                    .taskDefinitionArn,
                    .revision,
                    .status,
                    .requiresAttributes,
                    .compatibilities,
                    .registeredAt,
                    .registeredBy
                  )
                ' task-def.json > new-task-def.json

                aws ecs register-task-definition \
                  --cli-input-json file://new-task-def.json
                """
            }
        }

        stage('Deploy to ECS') {
            steps {
                sh """
                aws ecs update-service \
                  --cluster ${ECS_CLUSTER} \
                  --service ${ECS_SERVICE} \
                  --task-definition ${TASK_FAMILY} \
                  --force-new-deployment
                """
            }
        }
    }

    post {
        always { sh "docker image prune -f" }
    }
}
