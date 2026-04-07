pipeline {
    agent any

    tools {
        nodejs "Node20"   // make sure this exists in Jenkins
    }

    environment {
        SONAR_HOST_URL = "http://10.10.120.20:9000"
        DOCKER_IMAGE = "pde_ui_app"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SantoshKumar9290/PDE_UI.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh "npm install --force"
            }
        }

        stage('Clean previous build') {
            steps {
                sh "rm -rf .next node_modules/.cache || true"
            }
        }

        stage('Build Next.js App') {
            steps {
                sh "npm run build"
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('Sonar-jenkins-token') {
                    withCredentials([string(credentialsId: 'jenkins-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                            sonar-scanner \
                            -Dsonar.projectKey=pde_ui \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Run Docker Container') {
            steps {
                sh """
                    docker rm -f pde_ui || true
                    docker run -d \
                        --name pde_ui \
                        -p 3000:3000 \
                        ${DOCKER_IMAGE}:latest
                """
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Build + Sonar + Docker Deploy Completed!"
        }
        failure {
            echo "FAILED: Check pipeline logs!"
        }
    }
}
