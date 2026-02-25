pipeline {
    agent any

    environment {
        AWS_REGION     = "us-east-1"
        ECR_REPO       = "user-service"
        ECS_CLUSTER    = "DevCluster"
        ECS_SERVICE    = "user-service1-service-8cgwko84"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        AWS_ACCOUNT_ID = "249608715148"
        ECR_URI        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Build & Push Image') {
            steps {
                sh """
                docker build -t ${ECR_REPO}:${IMAGE_TAG} .
                docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                docker push ${ECR_URI}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to ECS (NEW IMAGE)') {
            steps {
                sh """
                aws ecs update-service \
                  --cluster ${ECS_CLUSTER} \
                  --service ${ECS_SERVICE} \
                  --force-new-deployment \
                  --region ${AWS_REGION}
                """
            }
        }
    }

    post {
        always {
            sh "docker image prune -f"
        }
    }
}
